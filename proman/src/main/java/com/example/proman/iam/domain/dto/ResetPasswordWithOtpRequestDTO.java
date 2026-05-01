package com.example.proman.iam.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordWithOtpRequestDTO {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String otp;

    @NotBlank
    private String newPassword;
}
