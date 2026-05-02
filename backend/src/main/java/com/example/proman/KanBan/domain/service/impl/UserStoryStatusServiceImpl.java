package com.example.proman.KanBan.domain.service.impl;

import com.example.proman.KanBan.domain.Entity.ProjectEntity;
import com.example.proman.KanBan.domain.Entity.UserStoryStatusEntity;
import com.example.proman.KanBan.domain.dto.UserStoryStatusCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryStatusResponseDTO;
import com.example.proman.KanBan.domain.repository.ProjectRepository;
import com.example.proman.KanBan.domain.repository.ProjectMembershipRepository;
import com.example.proman.KanBan.domain.repository.UserStoryRepository;
import com.example.proman.KanBan.domain.repository.UserStoryStatusRepository;
import com.example.proman.KanBan.domain.service.UserStoryStatusService;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.iam.domain.entity.UserPrincipal;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("userStoryStatusService")
@RequiredArgsConstructor
public class UserStoryStatusServiceImpl implements UserStoryStatusService {

    private final UserStoryStatusRepository statusRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository projectMembershipRepository;
    private final UserStoryRepository userStoryRepository;

    @Override
    @Transactional
    public UserStoryStatusResponseDTO createStatus(UserStoryStatusCreateRequestDTO request) {
        ProjectEntity project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        String normalizedName = request.getName().trim();
        if (statusRepository.existsByProject_IdAndNameIgnoreCase(project.getId(), normalizedName)) {
            throw new IllegalStateException("User story status already exists for this project");
        }

        UserStoryStatusEntity status = new UserStoryStatusEntity();
        status.setProject(project);
        status.setName(normalizedName);
        status.setClosed(isClosedName(normalizedName));
        if (request.getSortOrder() == null) {
            Integer nextOrder = statusRepository.findFirstByProject_IdOrderBySortOrderDescIdDesc(project.getId())
                    .map(existing -> existing.getSortOrder() + 1)
                    .orElse(1);
            status.setSortOrder(nextOrder);
        } else {
            status.setSortOrder(request.getSortOrder());
        }

        return toResponse(statusRepository.save(status));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStoryStatusResponseDTO> getStatusesByProject(Long projectId) {
        canAccessProject(projectId);
        return statusRepository.findAllByProject_IdOrderBySortOrderAscIdAsc(projectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteStatus(Long statusId) {
        UserStoryStatusEntity status = statusRepository.findById(statusId)
                .orElseThrow(() -> new EntityNotFoundException("User story status not found"));

        if (isSystemStatus(status.getName())) {
            throw new IllegalStateException("System user story statuses cannot be deleted");
        }

        if (userStoryRepository.countByStatus_Id(status.getId()) > 0) {
            throw new IllegalStateException("User story status is in use and cannot be deleted");
        }

        statusRepository.delete(status);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isProjectOwner(Long statusId) {
        UserStoryStatusEntity status = statusRepository.findById(statusId)
                .orElseThrow(() -> new EntityNotFoundException("User story status not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new AccessDeniedException("Unauthorized");
        }

        UserEntity currentUser = principal.getUser();
        return status.getProject().getOwner() != null
                && status.getProject().getOwner().getId().equals(currentUser.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canAccessProject(Long projectId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new AccessDeniedException("Unauthorized");
        }

        UserEntity currentUser = principal.getUser();
        boolean isOwner = project.getOwner() != null && project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = projectMembershipRepository.existsByProject_IdAndUser_Id(projectId, currentUser.getId());
        if (!isOwner && !isMember) {
            throw new AccessDeniedException("You do not have access to this project");
        }

        return true;
    }

    private UserStoryStatusResponseDTO toResponse(UserStoryStatusEntity status) {
        UserStoryStatusResponseDTO dto = new UserStoryStatusResponseDTO();
        dto.setId(status.getId());
        dto.setProjectId(status.getProject().getId());
        dto.setName(status.getName());
        dto.setClosed(status.isClosed());
        dto.setSortOrder(status.getSortOrder());
        return dto;
    }

    private boolean isClosedName(String name) {
        return "CLOSED".equalsIgnoreCase(name.trim());
    }

    private boolean isSystemStatus(String name) {
        String normalized = name == null ? "" : name.trim();
        return "NEW".equalsIgnoreCase(normalized) || "CLOSED".equalsIgnoreCase(normalized);
    }
}
