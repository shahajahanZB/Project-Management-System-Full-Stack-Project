package com.example.proman.KanBan.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UserStoryAttachmentResponseDTO {

    private Long id;
    private Long userStoryId;
    private Long userId;
    private String description;
    private String fileUrl;
    private String cloudinaryPublicId;
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
    private Instant createdAt;
}
