package com.example.proman.issue.domain.Dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class IssueTagIdsRequestDTO {

    @NotEmpty(message = "Tag IDs cannot be empty")
    private Set<Long> tagIds;
}
