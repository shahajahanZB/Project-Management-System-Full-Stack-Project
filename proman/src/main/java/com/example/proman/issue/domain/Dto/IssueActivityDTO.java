package com.example.proman.issue.domain.Dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueActivityDTO {

    private Long id;

    private String action;

    private Long performedBy;

    private Instant createdAt;
}