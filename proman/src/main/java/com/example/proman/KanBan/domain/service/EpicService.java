package com.example.proman.KanBan.domain.service;

import com.example.proman.KanBan.domain.dto.EpicAssigneesRequestDTO;
import com.example.proman.KanBan.domain.dto.EpicCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.EpicResponseDTO;
import com.example.proman.iam.domain.dto.UserRoleResponseDTO;

import java.util.List;

public interface EpicService {

    EpicResponseDTO createEpic(EpicCreateRequestDTO request);

    List<EpicResponseDTO> getEpicsByProject(Long projectId);

    EpicResponseDTO getEpicById(Long epicId);

    java.util.List<UserRoleResponseDTO> getAssignableUsers(Long epicId);

    List<EpicResponseDTO> assignUsers(Long epicId, EpicAssigneesRequestDTO request);

    List<EpicResponseDTO> removeUsers(Long epicId, EpicAssigneesRequestDTO request);
}
