package com.example.proman.issue.domain.Service.impl;

import com.example.proman.issue.domain.Dto.IssueCommentDTO;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.Repository.*;
import com.example.proman.issue.domain.Service.IssueCommentService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueCommentServiceImpl implements IssueCommentService {

    private final IssueCommentRepository issueCommentRepository;
    private final IssueRepository issueRepository;

    @Override
    public IssueCommentDTO addComment(Long issueId, IssueCommentDTO dto) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        IssueCommentEntity comment = new IssueCommentEntity();
        comment.setIssue(issue);
        comment.setUserId(dto.getUserId());
        comment.setComment(dto.getContent());
        comment.setCreatedAt(Instant.now());

        IssueCommentEntity saved = issueCommentRepository.save(comment);

        return mapToDTO(saved);
    }

    @Override
    public List<IssueCommentDTO> getCommentsByIssue(Long issueId) {

        return issueCommentRepository.findByIssueId(issueId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteComment(Long commentId) {
        issueCommentRepository.deleteById(commentId);
    }

    private IssueCommentDTO mapToDTO(IssueCommentEntity c) {
        return IssueCommentDTO.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .content(c.getComment())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
