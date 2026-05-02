package com.example.proman.issue.domain.Dto;

import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    private Long userId;

    private Instant createdAt;
}
