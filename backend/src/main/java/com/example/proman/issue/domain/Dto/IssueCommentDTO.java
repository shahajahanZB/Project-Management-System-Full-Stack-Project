package com.example.proman.issue.domain.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueCommentDTO {

    private Long id;

    private Long userId;

    @NotBlank(message = "Comment content is required")
    private String content;

    private Instant createdAt;

    private Instant updatedAt;

    private Boolean deleted;
}
