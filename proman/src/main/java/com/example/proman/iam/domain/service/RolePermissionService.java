package com.example.proman.iam.domain.service;

import com.example.proman.iam.domain.dto.*;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Set;

public interface RolePermissionService {
    void assignPermissions(Long roleId, List<Long> permissionIds);

    Set<String> getPermissions(Long userId);

    List<RoleResponseDTO> getAllRoles();

    RoleResponseDTO getPermissionsByRole(Long roleId);

    PermissionGroupedResponseDTO getAllPermissions();


    @Transactional
    void deassignPermissionsFromRole(RolePermissionDeassignDTO dto);

    RoleResponseDTO createRole(RoleCreateRequestDTO dto);

    List<UserRoleResponseDTO> getUsersByRole(String roleName);
}
