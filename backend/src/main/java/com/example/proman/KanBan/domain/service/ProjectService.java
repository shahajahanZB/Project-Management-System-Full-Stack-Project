package com.example.proman.KanBan.domain.service;

import com.example.proman.KanBan.domain.dto.ProjectCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.ProjectMembershipCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.ProjectMembershipRemoveRequestDTO;
import com.example.proman.KanBan.domain.dto.ProjectMembershipResponseDTO;
import com.example.proman.KanBan.domain.dto.ProjectResponseDTO;

import java.util.List;

public interface ProjectService {

    ProjectResponseDTO createProject(ProjectCreateRequestDTO request);

    List<ProjectResponseDTO> getVisibleProjects();

    ProjectResponseDTO getProjectById(Long projectId);

    boolean isProjectOwner(Long projectId);

    List<ProjectMembershipResponseDTO> addMembers(Long projectId, ProjectMembershipCreateRequestDTO request);

    List<ProjectMembershipResponseDTO> removeMembers(Long projectId, ProjectMembershipRemoveRequestDTO request);

    List<ProjectMembershipResponseDTO> getProjectMembers(Long projectId);

    void deleteProject(Long projectId);
}
