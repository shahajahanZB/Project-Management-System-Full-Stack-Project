package com.example.proman.iam.domain.service.impl;

import com.example.proman.iam.domain.dto.*;
import com.example.proman.iam.domain.entity.PermissionEntity;
import com.example.proman.iam.domain.entity.RoleEntity;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.iam.domain.entity.enums.PermissionCategory;
import com.example.proman.iam.domain.repository.PermissionRepository;
import com.example.proman.iam.domain.repository.RoleRepository;
import com.example.proman.iam.domain.repository.UserRepository;
import com.example.proman.iam.domain.service.RolePermissionService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RolePermissionServiceImpl implements RolePermissionService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public RolePermissionServiceImpl(RoleRepository roleRepository, PermissionRepository permissionRepository, UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void assignPermissions(Long roleId, List<Long> permissionIds) {
        RoleEntity role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        List<PermissionEntity> permissions = permissionRepository.findAllById(permissionIds);

        if (permissions.size() != permissionIds.size()) {
            throw new RuntimeException("One or more permissions not found");
        }

        role.getPermissions().addAll(permissions);
        roleRepository.save(role);
    }

    @Override
    public Set<String> getPermissions(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(PermissionEntity::getAccess)
                .collect(Collectors.toSet());
    }

    @Override
    public List<RoleResponseDTO> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(this::mapRole)
                .toList();
    }

    @Override
    public RoleResponseDTO getPermissionsByRole(Long roleId) {
        RoleEntity role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return mapRole(role);
    }

    @Override
    public PermissionGroupedResponseDTO getAllPermissions() {
        Map<PermissionCategory, List<PermissionDTO>> grouped = permissionRepository.findAll()
                .stream()
                .map(this::mapPermission)
                .collect(Collectors.groupingBy(PermissionDTO::getCategory));

        PermissionGroupedResponseDTO response = new PermissionGroupedResponseDTO();
        response.setModulePermissions(grouped.getOrDefault(PermissionCategory.MODULE, Collections.emptyList()));
        response.setDashboardPermissions(grouped.getOrDefault(PermissionCategory.DASHBOARD, Collections.emptyList()));
        return response;
    }

    @Override
    @Transactional
    public void deassignPermissionsFromRole(RolePermissionDeassignDTO dto) {
        RoleEntity role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (dto.getPermissionIds() == null || dto.getPermissionIds().isEmpty()) {
            throw new IllegalArgumentException("Permission IDs cannot be empty");
        }

        List<PermissionEntity> permissions = permissionRepository.findAllById(dto.getPermissionIds());
        if (permissions.isEmpty()) {
            throw new RuntimeException("No valid permissions found");
        }

        permissions.forEach(role.getPermissions()::remove);
        roleRepository.save(role);
    }

    @Override
    public RoleResponseDTO createRole(RoleCreateRequestDTO dto) {
        String roleName = dto.getName().toUpperCase();
        if (roleRepository.existsByNameIgnoreCase(roleName)) {
            throw new IllegalStateException("Role already exists");
        }

        RoleEntity role = new RoleEntity();
        role.setName(roleName);
        return mapRole(roleRepository.save(role));
    }

    @Override
    public List<UserRoleResponseDTO> getUsersByRole(String roleName) {
        return userRepository.findUsersByRoleName(roleName)
                .stream()
                .map(u -> new UserRoleResponseDTO(u.getId(), u.getUsername(), u.getEmail()))
                .toList();
    }

    private RoleResponseDTO mapRole(RoleEntity role) {
        RoleResponseDTO dto = new RoleResponseDTO();
        dto.setRoleId(role.getRoleId());
        dto.setRoleName(role.getName());

        Map<PermissionCategory, List<PermissionDTO>> grouped = role.getPermissions()
                .stream()
                .map(p -> {
                    PermissionDTO permDto = new PermissionDTO();
                    permDto.setId(p.getId());
                    permDto.setAccess(p.getAccess());
                    permDto.setCategory(p.getCategory());
                    return permDto;
                })
                .collect(Collectors.groupingBy(PermissionDTO::getCategory));

        dto.setModulePermissions(grouped.getOrDefault(PermissionCategory.MODULE, Collections.emptyList()));
        dto.setDashboardPermissions(grouped.getOrDefault(PermissionCategory.DASHBOARD, Collections.emptyList()));
        return dto;
    }

    private PermissionDTO mapPermission(PermissionEntity permission) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(permission.getId());
        dto.setAccess(permission.getAccess());
        dto.setCategory(permission.getCategory());
        return dto;
    }
}
