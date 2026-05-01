package com.example.proman.iam.domain.dto;

import com.example.proman.iam.domain.entity.enums.PermissionCategory;

import java.util.List;

public class PermissionBulkRequest {
    private List<PermissionRequest> permissions;

    public List<PermissionRequest> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<PermissionRequest> permissions) {
        this.permissions = permissions;
    }

    public static class PermissionRequest {
        private String access;
        private PermissionCategory category;

        public String getAccess() {
            return access;
        }

        public void setAccess(String access) {
            this.access = access;
        }

        public PermissionCategory getCategory() {
            return category;
        }

        public void setCategory(PermissionCategory category) {
            this.category = category;
        }
    }
}