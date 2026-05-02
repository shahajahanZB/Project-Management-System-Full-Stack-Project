package com.example.proman.issue.domain.Service.impl;

import com.example.proman.issue.domain.Dto.IssueTagDTO;
import com.example.proman.issue.domain.Repository.IssueTagRepository;
import com.example.proman.issue.domain.Service.IssueTagService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueTagServiceImpl implements IssueTagService {

    private final IssueTagRepository issueTagRepository;

    @Override
    public List<IssueTagDTO> getAllTags() {

        return issueTagRepository.findAll()
                .stream()
                .map(tag -> IssueTagDTO.builder()
                        .id(tag.getId())
                        .name(tag.getName())
                        .build())
                .collect(Collectors.toList());
    }
}
