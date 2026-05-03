package com.example.proman.iam.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileCreateRequestDTO {

    private String fullName;
    private String jobTitle;
    private String department;
    private String employeeCode;
    private String location;
    private String avatarUrl;
    private String phoneNumber;
    private String githubUsername;
    private String bio;
}
