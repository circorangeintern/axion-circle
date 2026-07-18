package com.cleanreport.service;

import com.cleanreport.dto.request.SavedFilterRequest;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.exception.UnauthorizedException;
import com.cleanreport.model.entity.SavedFilter;
import com.cleanreport.model.entity.User;
import com.cleanreport.repository.SavedFilterRepository;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavedFilterService {

    private static final int MAX_FILTERS_PER_USER = 10;

    private final SavedFilterRepository savedFilterRepository;
    private final UserRepository userRepository;

    @Transactional
    public SavedFilter createFilter(SavedFilterRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        if (savedFilterRepository.countByUserId(user.getId()) >= MAX_FILTERS_PER_USER) {
            throw new IllegalArgumentException("Maximum " + MAX_FILTERS_PER_USER + " saved filters allowed. Delete one to add a new one.");
        }

        SavedFilter filter = SavedFilter.builder()
                .user(user)
                .name(request.getName().trim())
                .categories(request.getCategories())
                .urgencyLevels(request.getUrgencyLevels())
                .statuses(request.getStatuses())
                .areaName(request.getAreaName())
                .build();

        SavedFilter saved = savedFilterRepository.save(filter);
        log.info("Saved filter created: '{}' for user {}", saved.getName(), userEmail);
        return saved;
    }

    public List<SavedFilter> getMyFilters(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        return savedFilterRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public void deleteFilter(UUID filterId, String userEmail) {
        SavedFilter filter = savedFilterRepository.findById(filterId)
                .orElseThrow(() -> new ResourceNotFoundException("Filter not found: " + filterId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        if (!filter.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only delete your own filters");
        }

        savedFilterRepository.delete(filter);
        log.info("Saved filter deleted: '{}' by {}", filter.getName(), userEmail);
    }
}
