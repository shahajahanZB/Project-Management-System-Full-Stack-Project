package com.example.proman.issue.domain.Dto;

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

    private String content;

    private Instant createdAt;
}