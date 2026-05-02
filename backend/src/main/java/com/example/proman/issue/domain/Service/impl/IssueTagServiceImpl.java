package com.example.proman.issue.domain.Service.impl;

import com.example.proman.issue.domain.Dto.IssueTagDTO;
import com.example.proman.issue.domain.Entity.IssueTagEntity;
import com.example.proman.issue.domain.Repository.IssueTagRepository;
import com.example.proman.issue.domain.Service.IssueTagService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueTagServiceImpl implements IssueTagService {

    private final IssueTagRepository issueTagRepository;

    @Override
    @Transactional(readOnly = true)
    public List<IssueTagDTO> getAllTags() {

        return issueTagRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional
    public IssueTagDTO createTag(IssueTagDTO dto) {
        String name = normalizeName(dto.getName());
        IssueTagEntity tag = issueTagRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    IssueTagEntity newTag = new IssueTagEntity();
                    newTag.setName(name);
                    return issueTagRepository.save(newTag);
                });
        return mapToDTO(tag);
    }

    private IssueTagDTO mapToDTO(IssueTagEntity tag) {
        return IssueTagDTO.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tag name cannot be empty");
        }
        return name.trim();
    }
}
