package com.example.proman.iam.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class RoleResponseDTO {
    private Long roleId;
    private String roleName;
    private Integer permissionCount;
    private List<PermissionDTO> permissions;
}
