package com.example.proman.KanBan.domain.service.impl;

import com.example.proman.KanBan.domain.Entity.ProjectEntity;
import com.example.proman.KanBan.domain.Entity.ProjectMembershipEntity;
import com.example.proman.KanBan.domain.dto.ProjectCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.ProjectMembershipCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.ProjectMembershipRemoveRequestDTO;
import com.example.proman.KanBan.domain.dto.ProjectMembershipResponseDTO;
import com.example.proman.KanBan.domain.dto.ProjectResponseDTO;
import com.example.proman.KanBan.domain.repository.ProjectMembershipRepository;
import com.example.proman.KanBan.domain.repository.ProjectRepository;
import com.example.proman.KanBan.domain.service.ProjectService;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.iam.domain.entity.UserPrincipal;
import com.example.proman.iam.domain.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service("projectService")
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository projectMembershipRepository;
    private final UserRepository userRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository,
                              ProjectMembershipRepository projectMembershipRepository,
                              UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.projectMembershipRepository = projectMembershipRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ProjectResponseDTO createProject(ProjectCreateRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Project request cannot be null");
        }
        if (projectRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalStateException("Project already exists");
        }

        UserEntity currentUser = getCurrentUser();

        ProjectEntity project = new ProjectEntity();
        project.setName(request.getName().trim());
        project.setDescription(request.getDescription().trim());
        project.setOwner(currentUser);

        return mapProject(projectRepository.save(project));
    }

    @Override
    public List<ProjectResponseDTO> getVisibleProjects() {
        UserEntity currentUser = getCurrentUser();
        return projectRepository.findVisibleProjectsByUserId(currentUser.getId())
                .stream()
                .map(this::mapProject)
                .toList();
    }

    @Override
    public ProjectResponseDTO getProjectById(Long projectId) {
        ProjectEntity project = getAccessibleProject(projectId);
        return mapProject(project);
    }

    @Override
    public boolean isProjectOwner(Long projectId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        UserEntity currentUser = getCurrentUser();
        return project.getOwner() != null && project.getOwner().getId().equals(currentUser.getId());
    }

    @Override
    @Transactional
    public List<ProjectMembershipResponseDTO> addMembers(Long projectId, ProjectMembershipCreateRequestDTO request) {
        if (request == null || request.getUserIds() == null || request.getUserIds().isEmpty()) {
            throw new IllegalArgumentException("User IDs cannot be empty");
        }

        if (request.getUserIds().size() != request.getUserIds().stream().distinct().count()) {
            throw new IllegalArgumentException("Duplicate user IDs are not allowed");
        }

        ProjectEntity project = getAccessibleProject(projectId);
        assertProjectOwner(project);

        List<UserEntity> users = userRepository.findAllById(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new IllegalArgumentException("One or more users not found");
        }

        Set<Long> existingUserIds = projectMembershipRepository.findAllByProject_Id(projectId)
                .stream()
                .map(membership -> membership.getUser().getId())
                .collect(Collectors.toSet());

        if (request.getUserIds().stream().anyMatch(existingUserIds::contains)) {
            throw new IllegalStateException("One or more users are already members of this project");
        }

        List<ProjectMembershipEntity> memberships = users.stream()
                .map(user -> {
                    ProjectMembershipEntity membership = new ProjectMembershipEntity();
                    membership.setProject(project);
                    membership.setUser(user);
                    return membership;
                })
                .toList();

        return projectMembershipRepository.saveAll(memberships)
                .stream()
                .map(this::mapMembership)
                .toList();
    }

    @Override
    @Transactional
    public List<ProjectMembershipResponseDTO> removeMembers(Long projectId, ProjectMembershipRemoveRequestDTO request) {
        if (request == null || request.getUserIds() == null || request.getUserIds().isEmpty()) {
            throw new IllegalArgumentException("User IDs cannot be empty");
        }

        if (request.getUserIds().size() != request.getUserIds().stream().distinct().count()) {
            throw new IllegalArgumentException("Duplicate user IDs are not allowed");
        }

        ProjectEntity project = getAccessibleProject(projectId);
        assertProjectOwner(project);

        List<ProjectMembershipEntity> memberships = projectMembershipRepository.findAllByProject_IdAndUser_IdIn(
                projectId,
                request.getUserIds()
        );

        if (memberships.size() != request.getUserIds().size()) {
            throw new IllegalArgumentException("One or more users are not members of this project");
        }

        List<ProjectMembershipResponseDTO> removed = memberships.stream()
                .map(this::mapMembership)
                .toList();

        projectMembershipRepository.deleteAll(memberships);
        return removed;
    }

    @Override
    public List<ProjectMembershipResponseDTO> getProjectMembers(Long projectId) {
        ProjectEntity project = getAccessibleProject(projectId);
        return projectMembershipRepository.findAllByProject_Id(project.getId())
                .stream()
                .map(this::mapMembership)
                .toList();
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId) {
        ProjectEntity project = getAccessibleProject(projectId);
        assertProjectOwner(project);

        projectMembershipRepository.deleteAllByProject_Id(projectId);
        projectRepository.delete(project);
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

    private void assertProjectOwner(ProjectEntity project) {
        UserEntity currentUser = getCurrentUser();
        boolean isOwner = project.getOwner() != null && project.getOwner().getId().equals(currentUser.getId());

        if (!isOwner) {
            throw new AccessDeniedException("Only the project owner can add members");
        }
    }

    private ProjectResponseDTO mapProject(ProjectEntity project) {
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setOwnerId(project.getOwner() != null ? project.getOwner().getId() : null);
        dto.setOwnerUsername(project.getOwner() != null ? project.getOwner().getUsername() : null);
        dto.setCreatedDate(project.getCreatedDate());
        dto.setModifiedDate(project.getModifiedDate());
        return dto;
    }

    private ProjectMembershipResponseDTO mapMembership(ProjectMembershipEntity membership) {
        ProjectMembershipResponseDTO dto = new ProjectMembershipResponseDTO();
        dto.setId(membership.getId());
        dto.setProjectId(membership.getProject().getId());
        dto.setUserId(membership.getUser().getId());
        dto.setUsername(membership.getUser().getUsername());
        dto.setEmail(membership.getUser().getEmail());
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
