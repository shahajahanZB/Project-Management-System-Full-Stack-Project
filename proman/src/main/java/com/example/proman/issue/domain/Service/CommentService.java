package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.CommentDTO;

import java.util.List;

public interface CommentService {

    CommentDTO addComment(Long issueId, CommentDTO dto);

    List<CommentDTO> getCommentsByIssue(Long issueId);

    void deleteComment(Long commentId);
}