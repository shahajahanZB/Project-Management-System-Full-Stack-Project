package com.example.proman.iam.domain.dto;

import lombok.Data;

@Data
public class RoleResponseDTO {
    private Long roleId;
    private String roleName;
    private Integer permissionCount;
}
