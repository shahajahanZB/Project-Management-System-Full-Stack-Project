package com.example.proman.KanBan.domain.service.impl;

import com.example.proman.KanBan.domain.Entity.EpicEntity;
import com.example.proman.KanBan.domain.Entity.ProjectEntity;
import com.example.proman.KanBan.domain.dto.EpicAssigneesRequestDTO;
import com.example.proman.KanBan.domain.dto.EpicCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.EpicResponseDTO;
import com.example.proman.KanBan.domain.repository.EpicRepository;
import com.example.proman.KanBan.domain.repository.ProjectMembershipRepository;
import com.example.proman.KanBan.domain.repository.ProjectRepository;
import com.example.proman.KanBan.domain.service.EpicService;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.iam.domain.entity.UserPrincipal;
import com.example.proman.iam.domain.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EpicServiceImpl implements EpicService {

    private final EpicRepository epicRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository projectMembershipRepository;
    private final UserRepository userRepository;

    public EpicServiceImpl(EpicRepository epicRepository,
                           ProjectRepository projectRepository,
                           ProjectMembershipRepository projectMembershipRepository,
                           UserRepository userRepository) {
        this.epicRepository = epicRepository;
        this.projectRepository = projectRepository;
        this.projectMembershipRepository = projectMembershipRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public EpicResponseDTO createEpic(EpicCreateRequestDTO request) {
        if (request == null || request.getProjectId() == null) {
            throw new IllegalArgumentException("Project id is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Epic name is required");
        }

        ProjectEntity project = getAccessibleProject(request.getProjectId());

        EpicEntity epic = new EpicEntity();
        epic.setProject(project);
        epic.setName(request.getName().trim());
        epic.setStatus(com.example.proman.KanBan.domain.Entity.enums.EpicStatus.NEW);

        return mapEpic(epicRepository.save(epic));
    }

    @Override
    public List<EpicResponseDTO> getEpicsByProject(Long projectId) {
        getAccessibleProject(projectId);
        return epicRepository.findAllByProject_IdOrderByIdDesc(projectId)
                .stream()
                .map(this::mapEpic)
                .toList();
    }

    @Override
    public EpicResponseDTO getEpicById(Long epicId) {
        EpicEntity epic = getAccessibleEpic(epicId);
        return mapEpic(epic);
    }

    @Override
    @Transactional
    public List<EpicResponseDTO> assignUsers(Long epicId, EpicAssigneesRequestDTO request) {
        if (request == null || request.getUserIds() == null || request.getUserIds().isEmpty()) {
            throw new IllegalArgumentException("User IDs cannot be empty");
        }
        if (request.getUserIds().size() != request.getUserIds().stream().distinct().count()) {
            throw new IllegalArgumentException("Duplicate user IDs are not allowed");
        }

        EpicEntity epic = getAccessibleEpic(epicId);
        ProjectEntity project = epic.getProject();

        List<UserEntity> users = userRepository.findAllById(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new IllegalArgumentException("One or more users not found");
        }

        Set<Long> allowedUserIds = getProjectParticipantIds(project.getId());
        if (request.getUserIds().stream().anyMatch(userId -> !allowedUserIds.contains(userId))) {
            throw new AccessDeniedException("Only project members can be assigned to an epic");
        }

        Set<Long> alreadyAssigned = epic.getAssignedUsers().stream()
                .map(UserEntity::getId)
                .collect(Collectors.toSet());
        if (request.getUserIds().stream().anyMatch(alreadyAssigned::contains)) {
            throw new IllegalStateException("One or more users are already assigned to this epic");
        }

        epic.getAssignedUsers().addAll(users);
        return List.of(mapEpic(epicRepository.save(epic)));
    }

    @Override
    @Transactional
    public List<EpicResponseDTO> removeUsers(Long epicId, EpicAssigneesRequestDTO request) {
        if (request == null || request.getUserIds() == null || request.getUserIds().isEmpty()) {
            throw new IllegalArgumentException("User IDs cannot be empty");
        }

        EpicEntity epic = getAccessibleEpic(epicId);
        Set<Long> idsToRemove = new LinkedHashSet<>(request.getUserIds());
        boolean anyMissing = idsToRemove.stream().anyMatch(id -> epic.getAssignedUsers().stream().noneMatch(user -> user.getId().equals(id)));
        if (anyMissing) {
            throw new IllegalArgumentException("One or more users are not assigned to this epic");
        }

        epic.getAssignedUsers().removeIf(user -> idsToRemove.contains(user.getId()));
        return List.of(mapEpic(epicRepository.save(epic)));
    }

    private EpicEntity getAccessibleEpic(Long epicId) {
        EpicEntity epic = epicRepository.findById(epicId)
                .orElseThrow(() -> new IllegalArgumentException("Epic not found"));
        getAccessibleProject(epic.getProject().getId());
        return epic;
    }

    private ProjectEntity getAccessibleProject(Long projectId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        UserEntity currentUser = getCurrentUser();
        boolean isOwner = project.getOwner() != null && project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = projectMembershipRepository.existsByProject_IdAndUser_Id(projectId, currentUser.getId());
        if (!isOwner && !isMember) {
            throw new AccessDeniedException("You do not have access to this project");
        }

        return project;
    }

    private Set<Long> getProjectParticipantIds(Long projectId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        Set<Long> ids = projectMembershipRepository.findAllByProject_Id(projectId)
                .stream()
                .map(membership -> membership.getUser().getId())
                .collect(Collectors.toSet());
        if (project.getOwner() != null) {
            ids.add(project.getOwner().getId());
        }
        return ids;
    }

    private EpicResponseDTO mapEpic(EpicEntity epic) {
        EpicResponseDTO dto = new EpicResponseDTO();
        dto.setId(epic.getId());
        dto.setProjectId(epic.getProject().getId());
        dto.setName(epic.getName());
        dto.setStatus(epic.getStatus());
        dto.setProgress(epic.getProgress());
        dto.setAssignedUserIds(epic.getAssignedUsers().stream()
                .map(UserEntity::getId)
                .collect(Collectors.toSet()));
        return dto;
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Authenticated user not found");
        }

        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}
