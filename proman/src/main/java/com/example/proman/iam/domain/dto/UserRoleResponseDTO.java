package com.example.proman.iam.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserRoleResponseDTO {

    private Long userId;
    private String username;
    private String email;
}