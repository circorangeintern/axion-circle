package com.cleanreport.service;

import com.cleanreport.dto.response.LeaderboardEntry;
import com.cleanreport.model.entity.User;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    /**
     * Get top contributors ranked by credit balance.
     */
    public List<LeaderboardEntry> getTopContributors(int limit) {
        List<User> topUsers = userRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "creditBalance"))
        ).getContent();

        AtomicInteger rankCounter = new AtomicInteger(1);

        return topUsers.stream()
                .map(user -> LeaderboardEntry.builder()
                        .rank(rankCounter.getAndIncrement())
                        .userId(user.getId())
                        .displayName(user.getDisplayName())
                        .avatarUrl(user.getAvatarUrl())
                        .creditBalance(user.getCreditBalance())
                        .reportCount(reportRepository.findByReporterId(user.getId()).size())
                        .build())
                .toList();
    }
}
