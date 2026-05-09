package com.example.proman.iam.domain.service;

import com.example.proman.iam.domain.dto.UserProfileResponseDTO;
import com.example.proman.iam.domain.dto.UserProfileUpdateRequestDTO;

public interface UserProfileService {

    UserProfileResponseDTO getProfile(Long userId);

    UserProfileResponseDTO updateProfile(Long userId, UserProfileUpdateRequestDTO request);
}
