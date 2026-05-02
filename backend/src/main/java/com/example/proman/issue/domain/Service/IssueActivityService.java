package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.IssueActivityDTO;

import java.util.List;

public interface IssueActivityService {

    void logActivity(Long issueId, String action, Long userId);

    List<IssueActivityDTO> getActivities(Long issueId);
}