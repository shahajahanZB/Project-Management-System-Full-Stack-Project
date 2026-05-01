package com.example.proman.iam.domain.dto;

import lombok.Data;
import java.util.List;

@Data
public class RolePermissionDeassignDTO {

    private Long roleId;

    // allow single or bulk removal
    private List<Long> permissionIds;
}