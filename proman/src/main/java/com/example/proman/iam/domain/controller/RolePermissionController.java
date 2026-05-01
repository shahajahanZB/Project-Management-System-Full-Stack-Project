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
    public ResponseEntity<RoleResponseDTO> createRole(
            @RequestBody RoleCreateRequestDTO dto
    ) {
        return ResponseEntity.ok(rolePermissionService.createRole(dto));
    }

    @PostMapping("/permissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
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
    public ResponseEntity<List<RoleResponseDTO>> getAllRoles() {
        return ResponseEntity.ok(rolePermissionService.getAllRoles());
    }

    @GetMapping("/{roleId}/permissions")
    public ResponseEntity<RoleResponseDTO> getPermissionsByRole(
            @PathVariable Long roleId
    ) {
        return ResponseEntity.ok(
                rolePermissionService.getPermissionsByRole(roleId)
        );
    }

    @GetMapping("/get-all-permissions")
    public ResponseEntity<PermissionGroupedResponseDTO> getAllPermissions() {
        return ResponseEntity.ok(rolePermissionService.getAllPermissions());
    }

    @DeleteMapping("/deassign-permissions")
    public ResponseEntity<String> deassignPermissionsFromRole(
            @RequestBody RolePermissionDeassignDTO dto
    ) {
        rolePermissionService.deassignPermissionsFromRole(dto);
        return ResponseEntity.ok("Permissions deassigned from role successfully");
    }

}