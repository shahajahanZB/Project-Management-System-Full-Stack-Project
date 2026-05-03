package com.example.proman.issue.domain.Service.impl;

import com.example.proman.iam.domain.entity.UserPrincipal;
import com.example.proman.issue.domain.Dto.IssueCommentDTO;
import com.example.proman.issue.domain.Entity.IssueActivityEntity;
import com.example.proman.issue.domain.Entity.IssueCommentEntity;
import com.example.proman.issue.domain.Entity.IssueEntity;
import com.example.proman.issue.domain.Repository.IssueActivityRepository;
import com.example.proman.issue.domain.Repository.IssueCommentRepository;
import com.example.proman.issue.domain.Repository.IssueRepository;
import com.example.proman.issue.domain.Service.IssueCommentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueCommentServiceImpl implements IssueCommentService {

    private final IssueCommentRepository issueCommentRepository;
    private final IssueRepository issueRepository;
    private final IssueActivityRepository issueActivityRepository;

    @Override
    @Transactional
    public IssueCommentDTO addComment(Long issueId, IssueCommentDTO dto) {
        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found"));
        Long currentUserId = getCurrentUserId();

        IssueCommentEntity comment = new IssueCommentEntity();
        comment.setIssue(issue);
        comment.setUserId(currentUserId);
        comment.setComment(requiredTrim(dto.getContent(), "Comment content is required"));

        IssueCommentEntity saved = issueCommentRepository.save(comment);
        recordActivity(issue, "Comment added", currentUserId);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueCommentDTO> getCommentsByIssue(Long issueId) {
        return issueCommentRepository.findByIssueIdAndDeletedFalseOrderByCreatedAtDesc(issueId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional
    public IssueCommentDTO updateComment(Long commentId, IssueCommentDTO dto) {
        IssueCommentEntity comment = issueCommentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        ensureCanModify(comment);

        comment.setComment(requiredTrim(dto.getContent(), "Comment content is required"));
        IssueCommentEntity saved = issueCommentRepository.save(comment);
        recordActivity(saved.getIssue(), "Comment edited", getCurrentUserId());
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        IssueCommentEntity comment = issueCommentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        ensureCanModify(comment);

        comment.setDeleted(true);
        comment.setDeletedAt(Instant.now());
        issueCommentRepository.save(comment);
        recordActivity(comment.getIssue(), "Comment deleted", getCurrentUserId());
    }

    private void ensureCanModify(IssueCommentEntity comment) {
        Long currentUserId = getCurrentUserId();
        if (!comment.getUserId().equals(currentUserId) && !isAdmin()) {
            throw new AccessDeniedException("Only the comment owner or an admin can modify this comment");
        }
        if (comment.isDeleted()) {
            throw new IllegalStateException("Deleted comments cannot be modified");
        }
    }

    private void recordActivity(IssueEntity issue, String activity, Long userId) {
        IssueActivityEntity entry = new IssueActivityEntity();
        entry.setIssue(issue);
        entry.setActivity(activity);
        entry.setUserId(userId);
        entry.setCreatedAt(Instant.now());
        issueActivityRepository.save(entry);
    }

    private IssueCommentDTO mapToDTO(IssueCommentEntity c) {
        return IssueCommentDTO.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .content(c.getComment())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .deleted(c.isDeleted())
                .build();
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

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> {
                    String value = authority.getAuthority();
                    return value.equals("ADMIN")
                            || value.equals("SUPERADMIN")
                            || value.equals("ROLE_ADMIN")
                            || value.equals("ROLE_SUPERADMIN")
                            || value.equals("ROLE_ROLE_ADMIN")
                            || value.equals("ROLE_ROLE_SUPERADMIN");
                });
    }
}
