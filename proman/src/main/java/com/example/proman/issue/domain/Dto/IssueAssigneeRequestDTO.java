package com.example.proman.issue.domain.Dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IssueAssigneeRequestDTO {

    @NotNull(message = "Assignee ID is required")
    @JsonAlias("assigneeID")
    private Long assigneeId;
}
