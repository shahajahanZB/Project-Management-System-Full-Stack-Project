package com.example.proman.iam.domain.controller;

import com.example.proman.iam.domain.dto.*;
import com.example.proman.iam.domain.service.RolePermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/iam/roles")
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    public RolePermissionController(RolePermissionService rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<RoleResponseDTO> createRole(
            @RequestBody RoleCreateRequestDTO dto
    ) {
        return ResponseEntity.ok(rolePermissionService.createRole(dto));
    }

    @PostMapping("/assign-permissions")
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<Void> assignPermissions(
            @RequestParam Long roleId,
            @RequestBody RolePermissionAssignRequest request) {

        rolePermissionService.assignPermissions(
                roleId,
                request.getPermissionIds()
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<List<RoleResponseDTO>> getAllRoles() {
        return ResponseEntity.ok(rolePermissionService.getAllRoles());
    }

    @GetMapping("/{roleId}/assigned-permissions")
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<List<PermissionDTO>> getPermissionsByRole(
            @PathVariable Long roleId
    ) {
        return ResponseEntity.ok(
                rolePermissionService.getPermissionsByRole(roleId)
        );
    }

    @GetMapping("/{roleId}/unassigned-permissions")
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<List<PermissionDTO>> getUnassignedPermissionsByRole(
            @PathVariable Long roleId
    ) {
        return ResponseEntity.ok(rolePermissionService.getUnassignedPermissionsByRole(roleId));
    }

    @GetMapping("/get-all-permissions")
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<PermissionGroupedResponseDTO> getAllPermissions() {
        return ResponseEntity.ok(rolePermissionService.getAllPermissions());
    }

    @DeleteMapping("/deassign-permissions")
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<String> deassignPermissionsFromRole(
            @RequestParam Long roleId,
            @RequestBody RolePermissionDeassignDTO dto
    ) {
        rolePermissionService.deassignPermissionsFromRole(roleId, dto);
        return ResponseEntity.ok("Permissions deassigned from role successfully");
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<String> deleteRole(@PathVariable Long roleId) {
        rolePermissionService.deleteRole(roleId);
        return ResponseEntity.ok("Role deleted successfully");
    }

}
