package com.example.proman.KanBan.domain.service.impl;

import com.example.proman.KanBan.domain.Entity.ProjectEntity;
import com.example.proman.KanBan.domain.Entity.TaskEntity;
import com.example.proman.KanBan.domain.Entity.UserStoryEntity;
import com.example.proman.KanBan.domain.Entity.enums.TaskStatus;
import com.example.proman.KanBan.domain.dto.TaskCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.TaskResponseDTO;
import com.example.proman.KanBan.domain.dto.TaskUpdateRequestDTO;
import com.example.proman.KanBan.domain.repository.ProjectMembershipRepository;
import com.example.proman.KanBan.domain.repository.ProjectRepository;
import com.example.proman.KanBan.domain.repository.TaskRepository;
import com.example.proman.KanBan.domain.repository.UserStoryRepository;
import com.example.proman.KanBan.domain.service.TaskService;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.iam.domain.entity.UserPrincipal;
import com.example.proman.iam.domain.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service("taskService")
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository projectMembershipRepository;
    private final UserStoryRepository userStoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TaskResponseDTO createTask(TaskCreateRequestDTO request) {
        ProjectEntity project = getAccessibleProject(request.getProjectId());
        UserStoryEntity userStory = resolveUserStory(request.getUserStoryId(), project);

        TaskEntity task = new TaskEntity();
        task.setProject(project);
        task.setUserStory(userStory);
        task.setSubject(normalizeText(request.getSubject(), "Task subject is required"));
        task.setStatus(request.getStatus() == null ? TaskStatus.NEW : request.getStatus());
        task.setAssignedTo(resolveAssignableUser(project, request.getAssignedToUserId()));

        return mapTask(taskRepository.save(task));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getTasksByProject(Long projectId) {
        getAccessibleProject(projectId);
        return taskRepository.findAllByProject_IdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::mapTask)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getTasksByUserStory(Long userStoryId) {
        UserStoryEntity userStory = getAccessibleUserStory(userStoryId);
        return taskRepository.findAllByUserStory_IdOrderByCreatedAtDesc(userStory.getId())
                .stream()
                .map(this::mapTask)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponseDTO getTaskById(Long taskId) {
        return mapTask(getAccessibleTask(taskId));
    }

    @Override
    @Transactional
    public TaskResponseDTO updateTask(Long taskId, TaskUpdateRequestDTO request) {
        TaskEntity task = getAccessibleTask(taskId);
        ProjectEntity currentProject = task.getProject();
        UserStoryEntity currentUserStory = task.getUserStory();

        if (request.getProjectId() != null && !request.getProjectId().equals(currentProject.getId())) {
            currentProject = getAccessibleProject(request.getProjectId());
            task.setProject(currentProject);
        }

        if (request.getUserStoryId() != null && !request.getUserStoryId().equals(currentUserStory.getId())) {
            currentUserStory = resolveUserStory(request.getUserStoryId(), currentProject);
            task.setUserStory(currentUserStory);
        }

        if (request.getSubject() != null && !request.getSubject().isBlank()) {
            task.setSubject(request.getSubject().trim());
        }

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        if (request.getAssignedToUserId() != null) {
            task.setAssignedTo(resolveAssignableUser(currentProject, request.getAssignedToUserId()));
        }

        return mapTask(taskRepository.save(task));
    }

    @Override
    @Transactional
    public void deleteTask(Long taskId) {
        TaskEntity task = getAccessibleTask(taskId);
        taskRepository.delete(task);
    }

    private TaskEntity getAccessibleTask(Long taskId) {
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        getAccessibleProject(task.getProject().getId());
        return task;
    }

    private UserStoryEntity getAccessibleUserStory(Long userStoryId) {
        UserStoryEntity userStory = userStoryRepository.findById(userStoryId)
                .orElseThrow(() -> new EntityNotFoundException("User story not found"));
        getAccessibleProject(userStory.getProject().getId());
        return userStory;
    }

    private ProjectEntity getAccessibleProject(Long projectId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        UserEntity currentUser = getCurrentUser();
        boolean isOwner = project.getOwner() != null && project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = projectMembershipRepository.existsByProject_IdAndUser_Id(projectId, currentUser.getId());
        if (!isOwner && !isMember) {
            throw new AccessDeniedException("You do not have access to this project");
        }

        return project;
    }

    private UserEntity resolveAssignableUser(ProjectEntity project, Long userId) {
        if (userId == null) {
            return null;
        }

        Set<Long> allowedUserIds = projectMembershipRepository.findAllByProject_Id(project.getId())
                .stream()
                .map(membership -> membership.getUser().getId())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (project.getOwner() != null) {
            allowedUserIds.add(project.getOwner().getId());
        }
        if (!allowedUserIds.contains(userId)) {
            throw new AccessDeniedException("Only project members can be assigned to a task");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Assigned user not found"));
    }

    private UserStoryEntity resolveUserStory(Long userStoryId, ProjectEntity project) {
        UserStoryEntity userStory = userStoryRepository.findById(userStoryId)
                .orElseThrow(() -> new EntityNotFoundException("User story not found"));
        if (!userStory.getProject().getId().equals(project.getId())) {
            throw new IllegalArgumentException("User story does not belong to this project");
        }
        return userStory;
    }

    private String normalizeText(String value, String emptyMessage) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(emptyMessage);
        }
        return value.trim();
    }

    private TaskResponseDTO mapTask(TaskEntity task) {
        TaskResponseDTO dto = new TaskResponseDTO();
        dto.setId(task.getId());
        dto.setProjectId(task.getProject().getId());
        dto.setUserStoryId(task.getUserStory().getId());
        dto.setSubject(task.getSubject());
        dto.setStatus(task.getStatus());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        if (task.getAssignedTo() != null) {
            dto.setAssignedToUserId(task.getAssignedTo().getId());
            dto.setAssignedToUsername(task.getAssignedTo().getUsername());
            dto.setAssignedToEmail(task.getAssignedTo().getEmail());
        }
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
