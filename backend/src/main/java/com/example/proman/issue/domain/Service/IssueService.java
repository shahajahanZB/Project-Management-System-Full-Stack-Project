package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.*;

import java.util.List;
import java.util.Set;

public interface IssueService {

    IssueResponseDTO createIssue(IssueRequestDTO request);

    IssueResponseDTO getIssueById(Long id);

    List<IssueResponseDTO> getAllIssues();

    List<IssueResponseDTO> getIssuesByProject(Long projectId);

    IssueResponseDTO updateIssue(Long id, IssueUpdateDTO update);

    IssueResponseDTO assignIssue(Long id, Long assigneeId);

    IssueResponseDTO removeAssignee(Long id);

    IssueResponseDTO addTags(Long id, Set<Long> tagIds);

    IssueResponseDTO removeTags(Long id, Set<Long> tagIds);

    IssueResponseDTO addWatchers(Long id, Set<Long> userIds);

    IssueResponseDTO removeWatchers(Long id, Set<Long> userIds);

    void deleteIssue(Long id);
}
