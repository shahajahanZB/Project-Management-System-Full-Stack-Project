package com.example.proman.iam.domain.service;

import com.example.proman.iam.domain.dto.*;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Set;

public interface RolePermissionService {
    void assignPermissions(Long roleId, List<Long> permissionIds);

    Set<String> getPermissions(Long userId);

    List<RoleResponseDTO> getAllRoles();

    List<PermissionDTO> getPermissionsByRole(Long roleId);

    List<PermissionDTO> getUnassignedPermissionsByRole(Long roleId);

    PermissionGroupedResponseDTO getAllPermissions();


    @Transactional
    void deassignPermissionsFromRole(Long roleId, RolePermissionDeassignDTO dto);

    RoleResponseDTO createRole(RoleCreateRequestDTO dto);

    List<UserRoleResponseDTO> getUsersByRole(String roleName);

    void deleteRole(Long roleId);
}
