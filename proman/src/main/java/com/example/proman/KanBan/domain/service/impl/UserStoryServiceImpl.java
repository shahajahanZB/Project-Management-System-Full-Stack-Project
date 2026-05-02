package com.example.proman.KanBan.domain.service.impl;

import com.example.proman.KanBan.domain.Entity.EpicEntity;
import com.example.proman.KanBan.domain.Entity.ProjectEntity;
import com.example.proman.KanBan.domain.Entity.UserStoryActivityEntity;
import com.example.proman.KanBan.domain.Entity.UserStoryAttachmentEntity;
import com.example.proman.KanBan.domain.Entity.UserStoryCommentEntity;
import com.example.proman.KanBan.domain.Entity.UserStoryEntity;
import com.example.proman.KanBan.domain.Entity.UserStoryStatusEntity;
import com.example.proman.KanBan.domain.Entity.UserStoryTagEntity;
import com.example.proman.KanBan.domain.dto.UserStoryActivityResponseDTO;
import com.example.proman.KanBan.domain.dto.UserStoryAttachmentCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryAttachmentResponseDTO;
import com.example.proman.KanBan.domain.dto.UserStoryCommentCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryCommentResponseDTO;
import com.example.proman.KanBan.domain.dto.UserStoryCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryResponseDTO;
import com.example.proman.KanBan.domain.dto.UserStoryStatusUpdateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryTagRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryUsersRequestDTO;
import com.example.proman.KanBan.domain.repository.EpicRepository;
import com.example.proman.KanBan.domain.repository.ProjectMembershipRepository;
import com.example.proman.KanBan.domain.repository.ProjectRepository;
import com.example.proman.KanBan.domain.repository.UserStoryActivityRepository;
import com.example.proman.KanBan.domain.repository.UserStoryAttachmentRepository;
import com.example.proman.KanBan.domain.repository.UserStoryCommentRepository;
import com.example.proman.KanBan.domain.repository.UserStoryRepository;
import com.example.proman.KanBan.domain.repository.UserStoryStatusRepository;
import com.example.proman.KanBan.domain.repository.UserStoryTagRepository;
import com.example.proman.KanBan.domain.service.UserStoryService;
import com.example.proman.KanBan.domain.Entity.enums.EpicStatus;
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

@Service("userStoryService")
@RequiredArgsConstructor
public class UserStoryServiceImpl implements UserStoryService {

    private final UserStoryRepository userStoryRepository;
    private final UserStoryStatusRepository userStoryStatusRepository;
    private final UserStoryTagRepository userStoryTagRepository;
    private final UserStoryAttachmentRepository attachmentRepository;
    private final UserStoryCommentRepository commentRepository;
    private final UserStoryActivityRepository activityRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository projectMembershipRepository;
    private final EpicRepository epicRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserStoryResponseDTO createUserStory(UserStoryCreateRequestDTO request) {
        ProjectEntity project = getAccessibleProject(request.getProjectId());
        EpicEntity epic = resolveEpic(request.getEpicId(), project);
        UserStoryStatusEntity status = resolveStatus(project.getId(), request.getStatusId());

        UserStoryEntity story = new UserStoryEntity();
        story.setProject(project);
        story.setEpic(epic);
        story.setStatus(status);
        story.setTitle(request.getTitle().trim());
        story.setDescription(request.getDescription() == null ? "" : request.getDescription().trim());

        story = userStoryRepository.save(story);
        recordActivity(story, "User story created");
        syncEpicLifecycle(epic);
        return mapStory(story);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStoryResponseDTO> getUserStoriesByProject(Long projectId) {
        getAccessibleProject(projectId);
        return userStoryRepository.findAllByProject_IdOrderByCreatedDateDesc(projectId)
                .stream()
                .map(this::mapStory)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStoryResponseDTO> getUserStoriesByEpic(Long epicId) {
        EpicEntity epic = getAccessibleEpic(epicId);
        return userStoryRepository.findAllByEpic_IdOrderByCreatedDateDesc(epic.getId())
                .stream()
                .map(this::mapStory)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserStoryResponseDTO getUserStoryById(Long storyId) {
        return mapStory(getAccessibleStory(storyId));
    }

    @Override
    @Transactional
    public UserStoryResponseDTO updateStatus(Long storyId, UserStoryStatusUpdateRequestDTO request) {
        UserStoryEntity story = getAccessibleStory(storyId);
        UserStoryStatusEntity status = resolveStatus(story.getProject().getId(), request.getStatusId());
        story.setStatus(status);
        story = userStoryRepository.save(story);
        recordActivity(story, "Status changed to " + status.getName());
        syncEpicLifecycle(story.getEpic());
        return mapStory(story);
    }

    @Override
    @Transactional
    public UserStoryResponseDTO assignUsers(Long storyId, UserStoryUsersRequestDTO request) {
        UserStoryEntity story = getAccessibleStory(storyId);
        List<Long> userIds = validateIds(request.getUserIds(), "User IDs cannot be empty");
        validateProjectUsers(story.getProject(), userIds);

        Set<Long> alreadyAssigned = story.getAssignedUsers().stream()
                .map(UserEntity::getId)
                .collect(Collectors.toSet());
        if (userIds.stream().anyMatch(alreadyAssigned::contains)) {
            throw new IllegalStateException("One or more users are already assigned to this user story");
        }

        List<UserEntity> users = userRepository.findAllById(userIds);
        story.getAssignedUsers().addAll(users);
        story = userStoryRepository.save(story);
        recordActivity(story, "Assigned users updated");
        return mapStory(story);
    }

    @Override
    @Transactional
    public UserStoryResponseDTO removeUsers(Long storyId, UserStoryUsersRequestDTO request) {
        UserStoryEntity story = getAccessibleStory(storyId);
        List<Long> userIds = validateIds(request.getUserIds(), "User IDs cannot be empty");

        Set<Long> assigned = story.getAssignedUsers().stream()
                .map(UserEntity::getId)
                .collect(Collectors.toSet());
        if (userIds.stream().anyMatch(id -> !assigned.contains(id))) {
            throw new IllegalStateException("One or more users are not assigned to this user story");
        }

        story.getAssignedUsers().removeIf(user -> userIds.contains(user.getId()));
        story = userStoryRepository.save(story);
        recordActivity(story, "Assigned users removed");
        return mapStory(story);
    }

    @Override
    @Transactional
    public UserStoryResponseDTO addWatchers(Long storyId, UserStoryUsersRequestDTO request) {
        UserStoryEntity story = getAccessibleStory(storyId);
        List<Long> userIds = validateIds(request.getUserIds(), "User IDs cannot be empty");
        validateProjectUsers(story.getProject(), userIds);

        Set<Long> existing = story.getWatchers().stream()
                .map(UserEntity::getId)
                .collect(Collectors.toSet());
        if (userIds.stream().anyMatch(existing::contains)) {
            throw new IllegalStateException("One or more users are already watching this user story");
        }

        story.getWatchers().addAll(userRepository.findAllById(userIds));
        story = userStoryRepository.save(story);
        recordActivity(story, "Watchers updated");
        return mapStory(story);
    }

    @Override
    @Transactional
    public UserStoryResponseDTO removeWatchers(Long storyId, UserStoryUsersRequestDTO request) {
        UserStoryEntity story = getAccessibleStory(storyId);
        List<Long> userIds = validateIds(request.getUserIds(), "User IDs cannot be empty");

        Set<Long> existing = story.getWatchers().stream()
                .map(UserEntity::getId)
                .collect(Collectors.toSet());
        if (userIds.stream().anyMatch(id -> !existing.contains(id))) {
            throw new IllegalStateException("One or more users are not watching this user story");
        }

        story.getWatchers().removeIf(user -> userIds.contains(user.getId()));
        story = userStoryRepository.save(story);
        recordActivity(story, "Watchers removed");
        return mapStory(story);
    }

    @Override
    @Transactional
    public UserStoryResponseDTO addTag(Long storyId, UserStoryTagRequestDTO request) {
        UserStoryEntity story = getAccessibleStory(storyId);
        String name = normalizeName(request.getName());
        if (story.getTags().stream().anyMatch(tag -> tag.getName().equalsIgnoreCase(name))) {
            throw new IllegalStateException("Tag already assigned to this user story");
        }

        UserStoryTagEntity tag = userStoryTagRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    UserStoryTagEntity newTag = new UserStoryTagEntity();
                    newTag.setName(name);
                    return userStoryTagRepository.save(newTag);
                });
        story.getTags().add(tag);
        story = userStoryRepository.save(story);
        recordActivity(story, "Tag added: " + name);
        return mapStory(story);
    }

    @Override
    @Transactional
    public UserStoryResponseDTO removeTag(Long storyId, UserStoryTagRequestDTO request) {
        UserStoryEntity story = getAccessibleStory(storyId);
        String name = normalizeName(request.getName());
        UserStoryTagEntity tag = story.getTags().stream()
                .filter(existing -> existing.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Tag is not assigned to this user story"));

        story.getTags().remove(tag);
        story = userStoryRepository.save(story);
        recordActivity(story, "Tag removed: " + name);
        return mapStory(story);
    }

    @Override
    @Transactional
    public UserStoryCommentResponseDTO addComment(Long storyId, UserStoryCommentCreateRequestDTO request) {
        UserStoryEntity story = getAccessibleStory(storyId);
        UserEntity currentUser = getCurrentUser();

        UserStoryCommentEntity comment = new UserStoryCommentEntity();
        comment.setUserStory(story);
        comment.setUserId(currentUser.getId());
        comment.setComment(request.getComment().trim());
        comment = commentRepository.save(comment);

        recordActivity(story, "Comment added");
        return mapComment(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStoryCommentResponseDTO> getComments(Long storyId) {
        getAccessibleStory(storyId);
        return commentRepository.findAllByUserStory_IdOrderByCreatedAtDesc(storyId)
                .stream()
                .map(this::mapComment)
                .toList();
    }

    @Override
    @Transactional
    public UserStoryAttachmentResponseDTO addAttachment(Long storyId, UserStoryAttachmentCreateRequestDTO request) {
        UserStoryEntity story = getAccessibleStory(storyId);
        UserEntity currentUser = getCurrentUser();

        UserStoryAttachmentEntity attachment = new UserStoryAttachmentEntity();
        attachment.setUserStory(story);
        attachment.setUserId(currentUser.getId());
        attachment.setFilePath(request.getFilePath().trim());
        attachment = attachmentRepository.save(attachment);

        recordActivity(story, "Attachment added");
        return mapAttachment(attachment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStoryAttachmentResponseDTO> getAttachments(Long storyId) {
        getAccessibleStory(storyId);
        return attachmentRepository.findAllByUserStory_IdOrderByCreatedAtDesc(storyId)
                .stream()
                .map(this::mapAttachment)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStoryActivityResponseDTO> getActivities(Long storyId) {
        getAccessibleStory(storyId);
        return activityRepository.findAllByUserStory_IdOrderByCreatedAtDesc(storyId)
                .stream()
                .map(this::mapActivity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canManageStory(Long storyId) {
        return canAccessStory(storyId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canViewStory(Long storyId) {
        return canAccessStory(storyId);
    }

    private UserStoryEntity getAccessibleStory(Long storyId) {
        UserStoryEntity story = userStoryRepository.findById(storyId)
                .orElseThrow(() -> new EntityNotFoundException("User story not found"));
        getAccessibleProject(story.getProject().getId());
        return story;
    }

    private EpicEntity getAccessibleEpic(Long epicId) {
        EpicEntity epic = epicRepository.findById(epicId)
                .orElseThrow(() -> new EntityNotFoundException("Epic not found"));
        getAccessibleProject(epic.getProject().getId());
        return epic;
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

    private boolean canAccessStory(Long storyId) {
        try {
            getAccessibleStory(storyId);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private UserStoryStatusEntity resolveStatus(Long projectId, Long statusId) {
        if (statusId != null) {
            return userStoryStatusRepository.findByIdAndProject_Id(statusId, projectId)
                    .orElseThrow(() -> new EntityNotFoundException("User story status not found"));
        }

        return userStoryStatusRepository.findByProject_IdAndNameIgnoreCase(projectId, "NEW")
                .orElseGet(() -> userStoryStatusRepository.findFirstByProject_IdOrderBySortOrderAscIdAsc(projectId)
                        .orElseThrow(() -> new IllegalStateException("No user story statuses configured for this project")));
    }

    private EpicEntity resolveEpic(Long epicId, ProjectEntity project) {
        if (epicId == null) {
            return null;
        }
        EpicEntity epic = epicRepository.findById(epicId)
                .orElseThrow(() -> new EntityNotFoundException("Epic not found"));
        if (!epic.getProject().getId().equals(project.getId())) {
            throw new IllegalArgumentException("Epic does not belong to this project");
        }
        return epic;
    }

    private void validateProjectUsers(ProjectEntity project, List<Long> userIds) {
        Set<Long> allowedUserIds = projectMembershipRepository.findAllByProject_Id(project.getId())
                .stream()
                .map(membership -> membership.getUser().getId())
                .collect(Collectors.toSet());
        if (project.getOwner() != null) {
            allowedUserIds.add(project.getOwner().getId());
        }

        List<Long> missing = userIds.stream()
                .filter(id -> !allowedUserIds.contains(id))
                .toList();
        if (!missing.isEmpty()) {
            throw new AccessDeniedException("Only project members can be assigned to a user story");
        }
    }

    private List<Long> validateIds(List<Long> ids, String emptyMessage) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException(emptyMessage);
        }
        if (ids.size() != ids.stream().distinct().count()) {
            throw new IllegalArgumentException("Duplicate IDs are not allowed");
        }
        return ids;
    }

    private void syncEpicLifecycle(EpicEntity epic) {
        if (epic == null) {
            return;
        }

        long totalStories = userStoryRepository.countByEpic_Id(epic.getId());
        if (totalStories == 0) {
            epic.setStatus(EpicStatus.NEW);
            epicRepository.save(epic);
            return;
        }

        long closedStories = userStoryRepository.countByEpic_IdAndStatus_ClosedTrue(epic.getId());
        epic.setStatus(closedStories == totalStories ? EpicStatus.CLOSED : EpicStatus.IN_PROGRESS);
        epicRepository.save(epic);
    }

    private void recordActivity(UserStoryEntity story, String activity) {
        UserStoryActivityEntity entry = new UserStoryActivityEntity();
        entry.setUserStory(story);
        entry.setUserId(getCurrentUser().getId());
        entry.setActivity(activity);
        activityRepository.save(entry);
    }

    private UserStoryResponseDTO mapStory(UserStoryEntity story) {
        UserStoryResponseDTO dto = new UserStoryResponseDTO();
        dto.setId(story.getId());
        dto.setProjectId(story.getProject().getId());
        dto.setEpicId(story.getEpic() == null ? null : story.getEpic().getId());
        dto.setStatusId(story.getStatus().getId());
        dto.setStatusName(story.getStatus().getName());
        dto.setStatusClosed(story.getStatus().isClosed());
        dto.setTitle(story.getTitle());
        dto.setDescription(story.getDescription());
        dto.setAssignedUserIds(story.getAssignedUsers().stream().map(UserEntity::getId).collect(Collectors.toSet()));
        dto.setWatcherIds(story.getWatchers().stream().map(UserEntity::getId).collect(Collectors.toSet()));
        dto.setTagNames(story.getTags().stream().map(UserStoryTagEntity::getName).collect(Collectors.toSet()));
        dto.setAttachmentCount((int) attachmentRepository.countByUserStory_Id(story.getId()));
        dto.setCommentCount((int) commentRepository.countByUserStory_Id(story.getId()));
        dto.setActivityCount((int) activityRepository.countByUserStory_Id(story.getId()));
        return dto;
    }

    private UserStoryCommentResponseDTO mapComment(UserStoryCommentEntity comment) {
        UserStoryCommentResponseDTO dto = new UserStoryCommentResponseDTO();
        dto.setId(comment.getId());
        dto.setUserStoryId(comment.getUserStory().getId());
        dto.setUserId(comment.getUserId());
        dto.setComment(comment.getComment());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }

    private UserStoryAttachmentResponseDTO mapAttachment(UserStoryAttachmentEntity attachment) {
        UserStoryAttachmentResponseDTO dto = new UserStoryAttachmentResponseDTO();
        dto.setId(attachment.getId());
        dto.setUserStoryId(attachment.getUserStory().getId());
        dto.setUserId(attachment.getUserId());
        dto.setFilePath(attachment.getFilePath());
        dto.setCreatedAt(attachment.getCreatedAt());
        return dto;
    }

    private UserStoryActivityResponseDTO mapActivity(UserStoryActivityEntity activity) {
        UserStoryActivityResponseDTO dto = new UserStoryActivityResponseDTO();
        dto.setId(activity.getId());
        dto.setUserStoryId(activity.getUserStory().getId());
        dto.setUserId(activity.getUserId());
        dto.setActivity(activity.getActivity());
        dto.setCreatedAt(activity.getCreatedAt());
        return dto;
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tag name cannot be empty");
        }
        return name.trim();
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
