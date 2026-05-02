package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.CommentDTO;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;

    @Override
    public CommentDTO addComment(Long issueId, CommentDTO dto) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        CommentEntity comment = new CommentEntity();
        comment.setIssue(issue);
        comment.setUserId(dto.getUserId());
        comment.setContent(dto.getContent());
        comment.setCreatedAt(Instant.now());

        CommentEntity saved = commentRepository.save(comment);

        return mapToDTO(saved);
    }

    @Override
    public List<CommentDTO> getCommentsByIssue(Long issueId) {

        return commentRepository.findByIssueId(issueId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    private CommentDTO mapToDTO(CommentEntity c) {
        return CommentDTO.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}