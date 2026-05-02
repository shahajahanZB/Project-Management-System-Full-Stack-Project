package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.AttachmentDTO;

import java.util.List;

public interface AttachmentService {

    AttachmentDTO addAttachment(Long issueId, AttachmentDTO dto);

    List<AttachmentDTO> getAttachments(Long issueId);

    void deleteAttachment(Long id);
}