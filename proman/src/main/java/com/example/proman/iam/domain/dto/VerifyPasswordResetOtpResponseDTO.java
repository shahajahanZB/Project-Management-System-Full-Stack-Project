package com.example.proman.iam.domain.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VerifyPasswordResetOtpResponseDTO {

    private String resetToken;
    private String message;
}
