package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.IssueTagDTO;

import java.util.List;

public interface IssueTagService {

    List<IssueTagDTO> getAllTags();
}