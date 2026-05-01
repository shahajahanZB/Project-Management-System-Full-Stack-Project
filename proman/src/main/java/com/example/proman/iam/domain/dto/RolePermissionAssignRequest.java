package com.example.proman.iam.domain.dto;

import java.util.List;

public class RolePermissionAssignRequest {

    private List<Long> permissionIds;

    public List<Long> getPermissionIds() {
        return permissionIds;
    }

    public void setPermissionIds(List<Long> permissionIds) {
        this.permissionIds = permissionIds;
    }
}