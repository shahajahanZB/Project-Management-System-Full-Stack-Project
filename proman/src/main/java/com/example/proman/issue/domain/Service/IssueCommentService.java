package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.IssueCommentDTO;

import java.util.List;

public interface IssueCommentService {

    IssueCommentDTO addComment(Long issueId, IssueCommentDTO dto);

    List<IssueCommentDTO> getCommentsByIssue(Long issueId);

    void deleteComment(Long commentId);
}