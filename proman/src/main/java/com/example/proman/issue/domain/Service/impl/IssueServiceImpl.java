package com.example.proman.issue.domain.Service.impl;

import com.example.proman.issue.domain.Dto.*;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.Enums.*;
import com.example.proman.issue.domain.Repository.*;
import com.example.proman.issue.domain.Service.IssueService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final IssueTagRepository issueTagRepository;

    // ==========================
    // CREATE ISSUE
    // ==========================
    @Override
    public IssueResponseDTO createIssue(IssueRequestDTO dto) {

        IssueEntity issue = buildEntity(dto);

        issue.setCreatedAt(Instant.now());
        issue.setUpdatedAt(Instant.now());

        IssueEntity saved = issueRepository.save(issue);

        return mapToResponse(saved);
    }

    // ==========================
    // GET ISSUE BY ID
    // ==========================
    @Override
    public IssueResponseDTO getIssueById(Long id) {

        IssueEntity issue = findIssueOrThrow(id);

        return mapToResponse(issue);
    }

    // ==========================
    // GET ALL ISSUES
    // ==========================
    @Override
    public List<IssueResponseDTO> getAllIssues() {

        return issueRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ==========================
    // UPDATE ISSUE
    // ==========================
    @Override
    public IssueResponseDTO updateIssue(Long id, IssueUpdateDTO dto) {

        IssueEntity issue = findIssueOrThrow(id);

        updateEntity(issue, dto);

        issue.setUpdatedAt(Instant.now());

        IssueEntity updated = issueRepository.save(issue);

        return mapToResponse(updated);
    }

    // ==========================
    // DELETE ISSUE
    // ==========================
    @Override
    public void deleteIssue(Long id) {
        issueRepository.deleteById(id);
    }

    // ==========================
    // 🔥 PRIVATE METHODS
    // ==========================

    // Find Issue
    private IssueEntity findIssueOrThrow(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
    }

    // Build Entity from Request
    private IssueEntity buildEntity(IssueRequestDTO dto) {

        IssueEntity issue = new IssueEntity();

        issue.setAssigneeID(dto.getAssigneeID());
        issue.setTitle(dto.getTitle());
        issue.setDescription(dto.getDescription());
        issue.setIsBlocked(dto.getIsBlocked());
        issue.setCreatedById(dto.getCreatedById());

        issue.setStatus(parseStatus(dto.getStatus()));
        issue.setType(parseType(dto.getType()));
        issue.setSeverity(parseSeverity(dto.getSeverity()));
        issue.setPriority(parsePriority(dto.getPriority()));

        issue.setTags(fetchTags(dto.getTagIds()));

        return issue;
    }

    // Update Existing Entity
    private void updateEntity(IssueEntity issue, IssueUpdateDTO dto) {

        if (dto.getAssigneeId() != null)
            issue.setAssigneeID(dto.getAssigneeId());

        if (dto.getTitle() != null)
            issue.setTitle(dto.getTitle());

        if (dto.getDescription() != null)
            issue.setDescription(dto.getDescription());

        if (dto.getIsBlocked() != null)
            issue.setIsBlocked(dto.getIsBlocked());

        if (dto.getStatus() != null)
            issue.setStatus(parseStatus(dto.getStatus()));

        if (dto.getType() != null)
            issue.setType(parseType(dto.getType()));

        if (dto.getSeverity() != null)
            issue.setSeverity(parseSeverity(dto.getSeverity()));

        if (dto.getPriority() != null)
            issue.setPriority(parsePriority(dto.getPriority()));

        if (dto.getTagIds() != null)
            issue.setTags(fetchTags(dto.getTagIds()));
    }

    // ==========================
    // ENUM PARSING
    // ==========================
    private IssueStatus parseStatus(String status) {
        return IssueStatus.valueOf(status.toUpperCase());
    }

    private IssueType parseType(String type) {
        return IssueType.valueOf(type.toUpperCase());
    }

    private IssueSeverity parseSeverity(String severity) {
        return IssueSeverity.valueOf(severity.toUpperCase());
    }

    private IssuePriority parsePriority(String priority) {
        return IssuePriority.valueOf(priority.toUpperCase());
    }

    // ==========================
    // TAG FETCHING
    // ==========================
    private Set<IssueTagEntity> fetchTags(Set<Long> tagIds) {
        if (tagIds == null) return new HashSet<>();
        return new HashSet<>(issueTagRepository.findAllById(tagIds));
    }

    // ==========================
    // ENTITY → DTO
    // ==========================
    private IssueResponseDTO mapToResponse(IssueEntity issue) {

        IssueResponseDTO dto = new IssueResponseDTO();

        dto.setId(issue.getId());
        dto.setAssigneeID(issue.getAssigneeID());
        dto.setTitle(issue.getTitle());
        dto.setDescription(issue.getDescription());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setUpdatedAt(issue.getUpdatedAt());
        dto.setIsBlocked(issue.getIsBlocked());

        dto.setStatus(issue.getStatus().name());
        dto.setType(issue.getType().name());
        dto.setSeverity(issue.getSeverity().name());
        dto.setPriority(issue.getPriority().name());

        dto.setCreatedById(issue.getCreatedById());

        // ONLY TAGS (clean architecture)
        if (issue.getTags() != null) {
            dto.setTags(issue.getTags().stream()
                    .map(tag -> IssueTagDTO.builder()
                            .id(tag.getId())
                            .name(tag.getName())
                            .build())
                    .collect(Collectors.toSet())
            );
        }

        return dto;
    }
}
