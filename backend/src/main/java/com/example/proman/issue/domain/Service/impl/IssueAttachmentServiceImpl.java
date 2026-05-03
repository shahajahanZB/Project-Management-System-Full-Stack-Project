package com.example.proman.issue.domain.Service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.proman.config.CloudinaryConfig;
import com.example.proman.iam.domain.entity.UserPrincipal;
import com.example.proman.issue.domain.Dto.IssueAttachmentDTO;
import com.example.proman.issue.domain.Entity.IssueActivityEntity;
import com.example.proman.issue.domain.Entity.IssueAttachmentEntity;
import com.example.proman.issue.domain.Entity.IssueEntity;
import com.example.proman.issue.domain.Repository.IssueActivityRepository;
import com.example.proman.issue.domain.Repository.IssueAttachmentRepository;
import com.example.proman.issue.domain.Repository.IssueRepository;
import com.example.proman.issue.domain.Service.IssueAttachmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IssueAttachmentServiceImpl implements IssueAttachmentService {

    private final IssueAttachmentRepository issueAttachmentRepository;
    private final IssueRepository issueRepository;
    private final IssueActivityRepository issueActivityRepository;
    private final Cloudinary cloudinary;
    private final CloudinaryConfig cloudinaryConfig;

    @Override
    @Transactional
    public IssueAttachmentDTO addAttachment(Long issueId, MultipartFile file) {
        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found"));
        Long currentUserId = getCurrentUserId();
        cloudinaryConfig.validateFileSize(file);

        String folder = cloudinaryConfig.normalizeFolder("proman/issues/" + issue.getId() + "/attachments");
        String publicId = null;
        Map<?, ?> uploadResult;
        try {
            uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "auto",
                            "folder", folder
                    )
            );
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read attachment file", ex);
        } catch (RuntimeException ex) {
            throw new IllegalStateException("Unable to upload attachment", ex);
        }

        Object fileUrlValue = uploadResult.get("secure_url");
        Object publicIdValue = uploadResult.get("public_id");
        String fileUrl = fileUrlValue == null ? null : String.valueOf(fileUrlValue);
        publicId = publicIdValue == null ? null : String.valueOf(publicIdValue);
        if (isMissingCloudinaryValue(fileUrl) || isMissingCloudinaryValue(publicId)) {
            deleteCloudinaryAsset(publicId);
            throw new IllegalStateException("Attachment upload failed");
        }

        try {
            IssueAttachmentEntity attachment = new IssueAttachmentEntity();
            attachment.setIssue(issue);
            attachment.setUserId(currentUserId);
            attachment.setFilePath(fileUrl);
            attachment.setCloudinaryPublicId(publicId);
            attachment.setFileName(normalizeFileName(file.getOriginalFilename()));
            attachment.setContentType(normalizeContentType(file.getContentType()));
            attachment.setFileSizeBytes(file.getSize());

            IssueAttachmentEntity saved = issueAttachmentRepository.saveAndFlush(attachment);
            recordActivity(issue, "Attachment added: " + saved.getFileName(), currentUserId);
            return mapToDTO(saved);
        } catch (RuntimeException ex) {
            deleteCloudinaryAsset(publicId);
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueAttachmentDTO> getAttachments(Long issueId) {
        return issueAttachmentRepository.findByIssueIdOrderByCreatedAtDesc(issueId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional
    public void deleteAttachment(Long id) {
        IssueAttachmentEntity attachment = issueAttachmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Attachment not found"));
        IssueEntity issue = attachment.getIssue();
        String publicId = attachment.getCloudinaryPublicId();
        String fileName = attachment.getFileName();

        issueAttachmentRepository.delete(attachment);
        issueAttachmentRepository.flush();
        deleteCloudinaryAsset(publicId);
        recordActivity(issue, "Attachment deleted: " + fileName, getCurrentUserId());
    }

    private IssueAttachmentDTO mapToDTO(IssueAttachmentEntity a) {
        return IssueAttachmentDTO.builder()
                .id(a.getId())
                .fileName(a.getFileName())
                .fileUrl(a.getFilePath())
                .cloudinaryPublicId(a.getCloudinaryPublicId())
                .contentType(a.getContentType())
                .fileSizeBytes(a.getFileSizeBytes())
                .userId(a.getUserId())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private void recordActivity(IssueEntity issue, String activity, Long userId) {
        IssueActivityEntity entry = new IssueActivityEntity();
        entry.setIssue(issue);
        entry.setActivity(activity);
        entry.setUserId(userId);
        entry.setCreatedAt(Instant.now());
        issueActivityRepository.save(entry);
    }

    private String normalizeFileName(String originalFileName) {
        if (originalFileName == null || originalFileName.isBlank()) {
            return "attachment";
        }
        return originalFileName.trim();
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "application/octet-stream";
        }
        return contentType.trim();
    }

    private boolean isMissingCloudinaryValue(String value) {
        return value == null || value.isBlank() || "null".equals(value);
    }

    private void deleteCloudinaryAsset(String publicId) {
        if (isMissingCloudinaryValue(publicId)) {
            return;
        }
        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", "auto")
            );
        } catch (IOException ignored) {
            // Best effort cleanup. If Cloudinary cleanup fails, keep the DB operation outcome.
        } catch (RuntimeException ignored) {
            // Best effort cleanup. The database transaction will still roll back.
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Authenticated user not found");
        }
        return principal.getId();
    }
}
