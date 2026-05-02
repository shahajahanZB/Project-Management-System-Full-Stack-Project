package com.example.proman.iam.domain.dto;

import com.example.proman.iam.domain.entity.enums.PermissionCategory;
import lombok.Data;

@Data
public class PermissionDTO {
    private Long id;
    private String access;
    private PermissionCategory category;
}