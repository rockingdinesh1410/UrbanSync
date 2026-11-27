package com.civictrack.repository;

import com.civictrack.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {
    List<IssueReport> findAllByOrderByCreatedAtDesc();
    List<IssueReport> findByStatusOrderByCreatedAtDesc(IssueStatus status);
    List<IssueReport> findByCategoryOrderByCreatedAtDesc(IssueCategory category);
    List<IssueReport> findByDistrictOrderByCreatedAtDesc(String district);
    List<IssueReport> findByDepartmentOrderByCreatedAtDesc(String department);
}
