package com.example.proman.iam.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UserProfileResponseDTO {

    private Long id;
    private Long userId;
    private String fullName;
    private String jobTitle;
    private String department;
    private String employeeCode;
    private String location;
    private String avatarUrl;
    private String phoneNumber;
    private String githubUsername;
    private String bio;
    private Instant createdAt;
    private Instant updatedAt;
}
