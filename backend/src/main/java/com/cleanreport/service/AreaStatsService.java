package com.cleanreport.service;

import com.cleanreport.dto.response.AreaStatsResponse;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaStatsService {

    private final EntityManager entityManager;

    /**
     * Get report stats grouped by area_name.
     */
    public List<AreaStatsResponse> getAreaStats() {
        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery("""
                SELECT 
                    COALESCE(area_name, 'Unknown') as area,
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved,
                    COUNT(*) FILTER (WHERE status != 'RESOLVED') as pending,
                    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as recent
                FROM reports
                GROUP BY area_name
                ORDER BY total DESC
                """).getResultList();

        return results.stream()
                .map(row -> AreaStatsResponse.builder()
                        .areaName((String) row[0])
                        .totalReports(((Number) row[1]).longValue())
                        .resolvedReports(((Number) row[2]).longValue())
                        .pendingReports(((Number) row[3]).longValue())
                        .recentReports(((Number) row[4]).longValue())
                        .build())
                .toList();
    }

    /**
     * Get stats for a specific area.
     */
    public AreaStatsResponse getStatsByArea(String areaName) {
        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery("""
                SELECT 
                    COALESCE(area_name, 'Unknown') as area,
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved,
                    COUNT(*) FILTER (WHERE status != 'RESOLVED') as pending,
                    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as recent
                FROM reports
                WHERE LOWER(area_name) LIKE LOWER(:area)
                GROUP BY area_name
                """).setParameter("area", "%" + areaName + "%")
                .getResultList();

        if (results.isEmpty()) {
            return AreaStatsResponse.builder()
                    .areaName(areaName)
                    .totalReports(0).resolvedReports(0).pendingReports(0).recentReports(0)
                    .build();
        }

        Object[] row = results.get(0);
        return AreaStatsResponse.builder()
                .areaName((String) row[0])
                .totalReports(((Number) row[1]).longValue())
                .resolvedReports(((Number) row[2]).longValue())
                .pendingReports(((Number) row[3]).longValue())
                .recentReports(((Number) row[4]).longValue())
                .build();
    }
}
