package com.example.proman.iam.domain.service;

import com.example.proman.iam.domain.dto.PermissionBulkRequest;

import java.util.List;

public interface PermissionService {
    Void bulkCreate(List<PermissionBulkRequest.PermissionRequest> permissions);
}
