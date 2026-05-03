package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.IssueAttachmentDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IssueAttachmentService {

    IssueAttachmentDTO addAttachment(Long issueId, MultipartFile file);

    List<IssueAttachmentDTO> getAttachments(Long issueId);

    void deleteAttachment(Long id);
}
