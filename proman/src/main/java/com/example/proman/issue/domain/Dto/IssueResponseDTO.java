package com.example.proman.issue.domain.Dto;

import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponseDTO {

    private Long id;

    private Long projectId;

    private Long assigneeId;

    private String title;

    private String description;

    private Instant createdAt;

    private Instant updatedAt;

    private LocalDate dueDate;

    private Boolean isBlocked;

    // ENUMS as String
    private String status;

    private String type;

    private String severity;

    private String priority;

    private Long createdById;

    // RELATIONS (mapped DTOs)
    private List<IssueCommentDTO> comments;

    private List<IssueAttachmentDTO> attachments;

    private List<IssueActivityDTO> activities;

    private Set<IssueTagDTO> tags;

    private Set<IssueWatcherDTO> watchers;
}
