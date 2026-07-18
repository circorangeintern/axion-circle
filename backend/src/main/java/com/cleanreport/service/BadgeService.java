package com.cleanreport.service;

import com.cleanreport.model.entity.User;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * SCRUM-117: Top Contributor Badge Logic.
 * The user with the highest credit balance gets the "Top Contributor" badge.
 * Badge is dynamic — recalculated on every check.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final UserRepository userRepository;

    /**
     * Check if a user is the current Top Contributor.
     */
    public boolean isTopContributor(User user) {
        Optional<User> topUser = userRepository.findAll(
                PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "creditBalance"))
        ).stream().findFirst();

        return topUser.isPresent() && topUser.get().getId().equals(user.getId());
    }

    /**
     * Get the badge label for a user (null if no badge).
     */
    public String getBadge(User user) {
        if (isTopContributor(user)) {
            return "TOP_CONTRIBUTOR";
        }
        if (user.getCreditBalance() >= 100) {
            return "ACTIVE_REPORTER";
        }
        if (user.getCreditBalance() >= 50) {
            return "COMMUNITY_HELPER";
        }
        return null;
    }
}
