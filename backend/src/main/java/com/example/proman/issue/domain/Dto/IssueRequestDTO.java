package com.example.proman.issue.domain.Dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueRequestDTO {

    private Long projectId;

    @JsonAlias("assigneeID")
    private Long assigneeId;

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000)
    private String description;

    private LocalDate dueDate;

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

    private Long createdById;

    // Relationships (only IDs)
    private Set<Long> tagIds;

    private Set<Long> watcherIds;
}
