package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.IssueAttachmentDTO;

import java.util.List;

public interface IssueAttachmentService {

    IssueAttachmentDTO addAttachment(Long issueId, IssueAttachmentDTO dto);

    List<IssueAttachmentDTO> getAttachments(Long issueId);

    void deleteAttachment(Long id);
}