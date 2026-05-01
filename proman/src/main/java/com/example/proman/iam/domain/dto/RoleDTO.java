package com.example.proman.iam.domain.dto;

import java.util.List;

public class RoleDTO {

    private Long id;
    private String name;
    private List<PermissionDTO> permissions;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<PermissionDTO> getPermissions() { return permissions; }
    public void setPermissions(List<PermissionDTO> permissions) { this.permissions = permissions; }
}
