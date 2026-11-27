package com.civictrack.repository;

import com.civictrack.model.IssueComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueCommentRepository extends JpaRepository<IssueComment, Long> {
    List<IssueComment> findByReportIdOrderByCreatedAtAsc(Long reportId);
}
