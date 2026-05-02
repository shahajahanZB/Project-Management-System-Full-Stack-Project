package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.IssueCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueCommentRepository extends JpaRepository<IssueCommentEntity, Long> {

    // get all comments of an issue
    List<IssueCommentEntity> findByIssueId(Long issueId);

    List<IssueCommentEntity> findByIssueIdAndDeletedFalseOrderByCreatedAtDesc(Long issueId);

    long countByIssue_IdAndDeletedFalse(Long issueId);
}
