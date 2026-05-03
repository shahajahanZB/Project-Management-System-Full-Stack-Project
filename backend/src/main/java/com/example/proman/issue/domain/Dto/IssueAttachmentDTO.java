package com.example.proman.issue.domain.Dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueAttachmentDTO {

    private Long id;

    private String fileName;

    private String fileUrl;

    private String cloudinaryPublicId;

    private String contentType;

    private Long fileSizeBytes;

    private Long userId;

    private Instant createdAt;
}
