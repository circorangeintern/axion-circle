package com.cleanreport.service;

import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.UserLevel;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Manages daily reporting streaks.
 * A streak increases when user reports on consecutive days.
 * Streak resets if user misses a day.
 * Bonus credits awarded at streak milestones (7, 14, 30 days).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StreakService {

    private final UserRepository userRepository;

    /**
     * Update streak on report submission. Returns bonus credits earned (0 if no milestone).
     */
    @Transactional
    public int updateStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate lastReport = user.getLastReportDate();

        if (lastReport == null) {
            // First ever report
            user.setStreakCount(1);
            user.setLastReportDate(today);
            userRepository.save(user);
            return 0;
        }

        if (lastReport.equals(today)) {
            // Already reported today — no streak change
            return 0;
        }

        if (lastReport.equals(today.minusDays(1))) {
            // Consecutive day — streak continues!
            user.setStreakCount(user.getStreakCount() + 1);
            user.setLastReportDate(today);
            userRepository.save(user);
            return getStreakBonus(user.getStreakCount());
        }

        // Missed a day — streak resets
        log.info("Streak reset for {} (was {} days, last report: {})", user.getEmail(), user.getStreakCount(), lastReport);
        user.setStreakCount(1);
        user.setLastReportDate(today);
        userRepository.save(user);
        return 0;
    }

    /**
     * Returns bonus credits for streak milestones.
     */
    private int getStreakBonus(int streakCount) {
        return switch (streakCount) {
            case 7 -> 3;
            case 14 -> 8;
            case 30 -> 15;
            case 60 -> 30;
            case 100 -> 50;
            default -> 0;
        };
    }

    /**
     * Recalculate and update user level based on lifetime credits.
     */
    @Transactional
    public void updateLevel(User user) {
        UserLevel newLevel = UserLevel.fromLifetimeCredits(user.getLifetimeCredits());
        if (newLevel != user.getLevel()) {
            log.info("Level up! {} → {} for user {}", user.getLevel(), newLevel, user.getEmail());
            user.setLevel(newLevel);
            userRepository.save(user);
        }
    }
}
