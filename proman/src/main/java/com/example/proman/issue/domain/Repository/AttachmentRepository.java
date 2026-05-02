package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.AttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<AttachmentEntity, Long> {

    // get attachments of an issue
    List<AttachmentEntity> findByIssueId(Long issueId);
}