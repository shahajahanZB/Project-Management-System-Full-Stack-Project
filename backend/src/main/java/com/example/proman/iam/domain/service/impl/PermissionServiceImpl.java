package com.example.proman.iam.domain.service.impl;

import com.example.proman.iam.domain.dto.PermissionBulkRequest;
import com.example.proman.iam.domain.entity.PermissionEntity;
import com.example.proman.iam.domain.repository.PermissionRepository;
import com.example.proman.iam.domain.service.PermissionService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionServiceImpl(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Transactional
    public Void bulkCreate(List<PermissionBulkRequest.PermissionRequest> permissions) {
        List<PermissionEntity> entities = permissions.stream()
                .map(p -> new PermissionEntity(p.getAccess(), p.getCategory()))
                .collect(Collectors.toList());

        permissionRepository.saveAll(entities);
        return null;
    }
}