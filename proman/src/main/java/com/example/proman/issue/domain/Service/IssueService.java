package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.*;

import java.util.List;

public interface IssueService {

    IssueResponseDTO createIssue(IssueRequestDTO request);

    IssueResponseDTO getIssueById(Long id);

    List<IssueResponseDTO> getAllIssues();

    IssueResponseDTO updateIssue(Long id, IssueUpdateDTO update);

    void deleteIssue(Long id);
}