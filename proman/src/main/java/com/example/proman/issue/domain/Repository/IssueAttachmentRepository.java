package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.IssueAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueAttachmentRepository extends JpaRepository<IssueAttachmentEntity, Long> {

    // get attachments of an issue
    List<IssueAttachmentEntity> findByIssueId(Long issueId);
}