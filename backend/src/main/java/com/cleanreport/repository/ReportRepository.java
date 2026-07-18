package com.cleanreport.repository;

import com.cleanreport.model.entity.Report;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID>, JpaSpecificationExecutor<Report> {

    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    Page<Report> findByCategory(ReportCategory category, Pageable pageable);

    Page<Report> findByStatusAndCategory(ReportStatus status, ReportCategory category, Pageable pageable);

    List<Report> findByReporterId(UUID reporterId);

    @Query(value = "SELECT * FROM reports r WHERE " +
            "ST_DWithin(r.location::geography, ST_MakePoint(:lng, :lat)::geography, :radiusMeters)",
            nativeQuery = true)
    List<Report> findNearby(@Param("lat") double lat, @Param("lng") double lng,
                            @Param("radiusMeters") double radiusMeters);

    // Full-text search
    @Query(value = "SELECT * FROM reports r WHERE " +
            "to_tsvector('english', COALESCE(r.title, '') || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.address, '')) " +
            "@@ plainto_tsquery('english', :keyword) " +
            "ORDER BY r.created_at DESC",
            countQuery = "SELECT count(*) FROM reports r WHERE " +
                    "to_tsvector('english', COALESCE(r.title, '') || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.address, '')) " +
                    "@@ plainto_tsquery('english', :keyword)",
            nativeQuery = true)
    Page<Report> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    long countByStatus(ReportStatus status);

    long countByCategory(ReportCategory category);
}
