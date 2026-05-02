package com.example.proman.issue.domain.Dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueRequestDTO {

    @NotNull(message = "Assignee ID is required")
    private Long assigneeID;

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000)
    private String description;

    @NotNull(message = "Blocked flag is required")
    private Boolean isBlocked;

    // ENUMS (String format for frontend)
    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Severity is required")
    private String severity;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotNull(message = "CreatedBy ID is required")
    private Long createdById;

    // Relationships (only IDs)
    private Set<Long> tagIds;
}