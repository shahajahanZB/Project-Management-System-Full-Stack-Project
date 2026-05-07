package com.example.proman.iam.domain.service.impl;

import com.example.proman.iam.domain.dto.UserProfileResponseDTO;
import com.example.proman.iam.domain.dto.UserProfileUpdateRequestDTO;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.iam.domain.entity.UserProfileEntity;
import com.example.proman.iam.domain.repository.UserProfileRepository;
import com.example.proman.iam.domain.service.UserProfileService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("userProfileService")
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public UserProfileResponseDTO getProfile(Long userId) {
        assertCurrentUser(userId);
        return toResponse(getExistingProfile(userId));
    }

    @Override
    @Transactional
    public UserProfileResponseDTO updateProfile(Long userId, UserProfileUpdateRequestDTO request) {
        assertCurrentUser(userId);
        UserProfileEntity profile = getExistingProfile(userId);
        applyUpdateRequest(profile, request);
        return toResponse(userProfileRepository.save(profile));
    }

    private UserProfileEntity getExistingProfile(Long userId) {
        return userProfileRepository.findByUser_Id(userId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found"));
    }

    private void applyUpdateRequest(UserProfileEntity profile, UserProfileUpdateRequestDTO request) {
        if (request.getJobTitle() != null) {
            profile.setJobTitle(request.getJobTitle());
        }
        if (request.getDepartment() != null) {
            profile.setDepartment(request.getDepartment());
        }
        if (request.getEmployeeCode() != null) {
            profile.setEmployeeCode(request.getEmployeeCode());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getPhoneNumber() != null) {
            profile.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getGithubUsername() != null) {
            profile.setGithubUsername(request.getGithubUsername());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
    }

    private UserProfileResponseDTO toResponse(UserProfileEntity profile) {
        UserProfileResponseDTO dto = new UserProfileResponseDTO();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser() == null ? null : profile.getUser().getId());
        dto.setFullName(profile.getFullName());
        dto.setJobTitle(profile.getJobTitle());
        dto.setDepartment(profile.getDepartment());
        dto.setEmployeeCode(profile.getEmployeeCode());
        dto.setLocation(profile.getLocation());
        dto.setAvatarUrl(profile.getAvatarUrl());
        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setGithubUsername(profile.getGithubUsername());
        dto.setBio(profile.getBio());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }

    private void assertCurrentUser(Long targetUserId) {
        UserEntity currentUser = getCurrentUser();
        if (currentUser.getId().equals(targetUserId)) {
            return;
        }
        throw new AccessDeniedException("You do not have access to this profile");
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof com.example.proman.iam.domain.entity.UserPrincipal principal)) {
            throw new IllegalStateException("Authenticated user not found");
        }
        return principal.getUser();
    }
}
