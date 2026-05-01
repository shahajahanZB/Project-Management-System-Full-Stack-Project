package com.example.proman.iam.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.Set;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Instant createdAt;
    private Set<String> roles;
}
