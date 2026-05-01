package com.example.proman.iam.domain.service;

import com.example.proman.iam.domain.dto.AssignRolesRequest;
import com.example.proman.iam.domain.dto.CreateUserRequest;
import com.example.proman.iam.domain.dto.CurrentUserDTO;
import com.example.proman.iam.domain.dto.ForgotPasswordOtpRequestDTO;
import com.example.proman.iam.domain.dto.LoginRequestDTO;
import com.example.proman.iam.domain.dto.ResetPasswordWithOtpRequestDTO;
import com.example.proman.iam.domain.dto.UserResponse;
import com.example.proman.iam.domain.dto.UserWithRolesDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface AuthService {
    ResponseEntity<String> register(CreateUserRequest user);

    Map<String, String> verify(LoginRequestDTO user);

    String requestPasswordResetOtp(ForgotPasswordOtpRequestDTO request);

    String resetPasswordWithOtp(ResetPasswordWithOtpRequestDTO request);

    CurrentUserDTO getCurrentUser();

    List<UserResponse> assignRoles(Set<Long> userIds, Long roleId);

    List<UserWithRolesDTO> getAllUsersWithRoles();

    List<UserResponse> getUsersWithNoRoles();

    List<UserResponse> deassignRoles(AssignRolesRequest dto);

    void deleteUser(Long userId);
}
