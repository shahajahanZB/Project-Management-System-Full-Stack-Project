package com.example.proman.issue.domain.Service.impl;

import com.example.proman.iam.domain.entity.UserPrincipal;
import com.example.proman.issue.domain.Dto.IssueAttachmentDTO;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.Repository.*;
import com.example.proman.issue.domain.Service.IssueAttachmentService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueAttachmentServiceImpl implements IssueAttachmentService {

    private final IssueAttachmentRepository issueAttachmentRepository;
    private final IssueRepository issueRepository;
    private final IssueActivityRepository issueActivityRepository;

    @Override
    @Transactional
    public IssueAttachmentDTO addAttachment(Long issueId, IssueAttachmentDTO dto) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found"));

        IssueAttachmentEntity attachment = new IssueAttachmentEntity();
        attachment.setIssue(issue);
        attachment.setUserId(getCurrentUserId());
        attachment.setFileName(dto.getFileName());
        attachment.setFilePath(requiredTrim(dto.getFileUrl(), "File URL is required"));

        IssueAttachmentEntity saved = issueAttachmentRepository.save(attachment);
        recordActivity(issue, "Attachment added", getCurrentUserId());
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueAttachmentDTO> getAttachments(Long issueId) {

        return issueAttachmentRepository.findByIssueIdOrderByCreatedAtDesc(issueId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional
    public void deleteAttachment(Long id) {
        IssueAttachmentEntity attachment = issueAttachmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Attachment not found"));
        issueAttachmentRepository.delete(attachment);
        recordActivity(attachment.getIssue(), "Attachment deleted", getCurrentUserId());
    }

    private IssueAttachmentDTO mapToDTO(IssueAttachmentEntity a) {
        return IssueAttachmentDTO.builder()
                .id(a.getId())
                .fileName(a.getFileName())
                .fileUrl(a.getFilePath())
                .userId(a.getUserId())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private void recordActivity(IssueEntity issue, String activity, Long userId) {
        IssueActivityEntity entry = new IssueActivityEntity();
        entry.setIssue(issue);
        entry.setActivity(activity);
        entry.setUserId(userId);
        entry.setCreatedAt(Instant.now());
        issueActivityRepository.save(entry);
    }

    private String requiredTrim(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Authenticated user not found");
        }
        return principal.getId();
    }
}
