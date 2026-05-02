package com.example.proman.iam.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class PermissionGroupedResponseDTO {
    private List<PermissionDTO> modulePermissions;
    private List<PermissionDTO> dashboardPermissions;
}
