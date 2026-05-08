package com.example.proman.iam.domain.controller;

import com.example.proman.iam.domain.dto.UserProfileResponseDTO;
import com.example.proman.iam.domain.dto.UserProfileUpdateRequestDTO;
import com.example.proman.iam.domain.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/v1/iam/users/{userId}/profile")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<UserProfileResponseDTO> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userProfileService.getProfile(userId));
    }

    @PatchMapping
    public ResponseEntity<UserProfileResponseDTO> updateProfile(
            @PathVariable Long userId,
            @RequestBody UserProfileUpdateRequestDTO request
    ) {
        return ResponseEntity.ok(userProfileService.updateProfile(userId, request));
    }
}
