package com.example.proman.iam.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class AssignRolesRequest {
    private Set<Long> userIds;
    private Long roleId;
}
