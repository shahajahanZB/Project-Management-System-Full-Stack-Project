package com.example.proman.issue.domain.Dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class IssueUsersRequestDTO {

    @NotEmpty(message = "User IDs cannot be empty")
    private Set<Long> userIds;
}
