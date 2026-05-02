package com.example.proman.KanBan.domain.service;

import com.example.proman.KanBan.domain.dto.UserStoryStatusCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryStatusResponseDTO;

import java.util.List;

public interface UserStoryStatusService {

    UserStoryStatusResponseDTO createStatus(UserStoryStatusCreateRequestDTO request);

    List<UserStoryStatusResponseDTO> getStatusesByProject(Long projectId);

    void deleteStatus(Long statusId);

    boolean isProjectOwner(Long statusId);

    boolean canAccessProject(Long projectId);
}
