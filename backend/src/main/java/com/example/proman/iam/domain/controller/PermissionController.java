package com.example.proman.iam.domain.controller;

import com.example.proman.iam.domain.dto.PermissionBulkRequest;
import com.example.proman.iam.domain.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/iam/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping("/bulk")
    public ResponseEntity<Void> bulkCreate(@RequestBody PermissionBulkRequest request) {
        permissionService.bulkCreate(request.getPermissions());
        return ResponseEntity.ok().build();
    }
}
