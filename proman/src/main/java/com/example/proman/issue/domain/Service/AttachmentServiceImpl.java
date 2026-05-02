package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.AttachmentDTO;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final IssueRepository issueRepository;

    @Override
    public AttachmentDTO addAttachment(Long issueId, AttachmentDTO dto) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        AttachmentEntity attachment = new AttachmentEntity();
        attachment.setIssue(issue);
        attachment.setFileName(dto.getFileName());
        attachment.setFileUrl(dto.getFileUrl());

        return mapToDTO(attachmentRepository.save(attachment));
    }

    @Override
    public List<AttachmentDTO> getAttachments(Long issueId) {

        return attachmentRepository.findByIssueId(issueId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAttachment(Long id) {
        attachmentRepository.deleteById(id);
    }

    private AttachmentDTO mapToDTO(AttachmentEntity a) {
        return AttachmentDTO.builder()
                .id(a.getId())
                .fileName(a.getFileName())
                .fileUrl(a.getFileUrl())
                .build();
    }
}