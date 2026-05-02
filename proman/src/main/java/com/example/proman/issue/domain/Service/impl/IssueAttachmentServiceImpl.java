package com.example.proman.issue.domain.Service.impl;

import com.example.proman.issue.domain.Dto.IssueAttachmentDTO;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.Repository.*;
import com.example.proman.issue.domain.Service.IssueAttachmentService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueAttachmentServiceImpl implements IssueAttachmentService {

    private final IssueAttachmentRepository issueAttachmentRepository;
    private final IssueRepository issueRepository;

    @Override
    public IssueAttachmentDTO addAttachment(Long issueId, IssueAttachmentDTO dto) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        IssueAttachmentEntity attachment = new IssueAttachmentEntity();
        attachment.setIssue(issue);
        attachment.setFilePath(dto.getFileUrl());

        return mapToDTO(issueAttachmentRepository.save(attachment));
    }

    @Override
    public List<IssueAttachmentDTO> getAttachments(Long issueId) {

        return issueAttachmentRepository.findByIssueId(issueId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAttachment(Long id) {
        issueAttachmentRepository.deleteById(id);
    }

    private IssueAttachmentDTO mapToDTO(IssueAttachmentEntity a) {
        return IssueAttachmentDTO.builder()
                .id(a.getId())
                .fileName(a.getFilePath())
                .fileUrl(a.getFilePath())
                .build();
    }
}
