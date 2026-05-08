package com.example.proman.issue.domain.Service.impl;

import com.example.proman.KanBan.domain.Entity.ProjectEntity;
import com.example.proman.KanBan.domain.repository.ProjectMembershipRepository;
import com.example.proman.KanBan.domain.repository.ProjectRepository;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.iam.domain.entity.UserPrincipal;
import com.example.proman.iam.domain.repository.UserRepository;
import com.example.proman.issue.domain.Dto.*;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.Enums.*;
import com.example.proman.issue.domain.Repository.*;
import com.example.proman.issue.domain.Service.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final IssueTagRepository issueTagRepository;
    private final IssueWatcherRepository issueWatcherRepository;
    private final IssueCommentRepository issueCommentRepository;
    private final IssueAttachmentRepository issueAttachmentRepository;
    private final IssueActivityRepository issueActivityRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository projectMembershipRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public IssueResponseDTO createIssue(Long projectId,IssueRequestDTO dto) {
        UserEntity currentUser = getCurrentUser();
        ProjectEntity project = getAccessibleProject(projectId);

        IssueEntity issue = new IssueEntity();
        issue.setProject(project);
        issue.setAssignee(resolveOptionalProjectUser(project, dto.getAssigneeId()));
        issue.setTitle(requiredTrim(dto.getTitle(), "Title is required"));
        issue.setDescription(requiredTrim(dto.getDescription(), "Description is required"));
        issue.setDueDate(dto.getDueDate());
        issue.setIsBlocked(dto.getIsBlocked() == null ? Boolean.FALSE : dto.getIsBlocked());
        issue.setCreatedBy(currentUser);
        issue.setStatus(parseStatus(dto.getStatus()));
        issue.setType(parseType(dto.getType()));
        issue.setSeverity(parseSeverity(dto.getSeverity()));
        issue.setPriority(parsePriority(dto.getPriority()));
        issue.setTags(fetchTags(dto.getTagIds()));

        IssueEntity saved = issueRepository.save(issue);
        recordActivity(saved, "Issue created", currentUser.getId());

        if (dto.getWatcherIds() != null && !dto.getWatcherIds().isEmpty()) {
            addWatchersInternal(saved, project, dto.getWatcherIds(), currentUser.getId(), false);
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public IssueResponseDTO getIssueById(Long id) {
        return mapToResponse(getAccessibleIssue(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponseDTO> getAllIssues() {
        return issueRepository.findAll()
                .stream()
                .filter(issue -> canAccessProject(issue.getProject()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponseDTO> getIssuesByProject(Long projectId) {
        getAccessibleProject(projectId);
        return issueRepository.findAllByProject_IdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public IssueResponseDTO updateIssue(Long id, IssueUpdateDTO dto) {
        IssueEntity issue = getAccessibleIssue(id);
        Long currentUserId = getCurrentUser().getId();

        if (dto.getTitle() != null) {
            issue.setTitle(requiredTrim(dto.getTitle(), "Title is required"));
        }
        if (dto.getDescription() != null) {
            issue.setDescription(requiredTrim(dto.getDescription(), "Description is required"));
        }
        if (dto.getDueDate() != null) {
            issue.setDueDate(dto.getDueDate());
        }
        if (dto.getIsBlocked() != null) {
            issue.setIsBlocked(dto.getIsBlocked());
        }
        if (dto.getStatus() != null) {
            IssueStatus newStatus = parseStatus(dto.getStatus());
            if (!Objects.equals(issue.getStatus(), newStatus)) {
                recordActivity(issue, "Status changed from " + issue.getStatus() + " to " + newStatus, currentUserId);
            }
            issue.setStatus(newStatus);
        }
        if (dto.getType() != null) {
            issue.setType(parseType(dto.getType()));
        }
        if (dto.getSeverity() != null) {
            issue.setSeverity(parseSeverity(dto.getSeverity()));
        }
        if (dto.getPriority() != null) {
            issue.setPriority(parsePriority(dto.getPriority()));
        }
        if (dto.getAssigneeId() != null) {
            updateAssignee(issue, dto.getAssigneeId(), currentUserId);
        }
        if (dto.getTagIds() != null) {
            issue.setTags(fetchTags(dto.getTagIds()));
            recordActivity(issue, "Tags replaced", currentUserId);
        }

        IssueEntity updated = issueRepository.save(issue);
        if (dto.getWatcherIds() != null) {
            replaceWatchers(updated, dto.getWatcherIds(), currentUserId);
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public IssueResponseDTO assignIssue(Long id, Long assigneeId) {
        IssueEntity issue = getAccessibleIssue(id);
        updateAssignee(issue, assigneeId, getCurrentUser().getId());
        return mapToResponse(issueRepository.save(issue));
    }

    @Override
    @Transactional
    public IssueResponseDTO removeAssignee(Long id) {
        IssueEntity issue = getAccessibleIssue(id);
        Long currentUserId = getCurrentUser().getId();
        if (issue.getAssignee() != null) {
            Long previous = issue.getAssignee().getId();
            issue.setAssignee(null);
            recordActivity(issue, "Assignee removed: " + previous, currentUserId);
        }
        return mapToResponse(issueRepository.save(issue));
    }

    @Override
    @Transactional
    public IssueResponseDTO addTags(Long id, Set<Long> tagIds) {
        IssueEntity issue = getAccessibleIssue(id);
        issue.getTags().addAll(fetchTags(tagIds));
        recordActivity(issue, "Tags added", getCurrentUser().getId());
        return mapToResponse(issueRepository.save(issue));
    }

    @Override
    @Transactional
    public IssueResponseDTO removeTags(Long id, Set<Long> tagIds) {
        IssueEntity issue = getAccessibleIssue(id);
        Set<Long> ids = validateIdSet(tagIds, "Tag IDs cannot be empty");
        issue.getTags().removeIf(tag -> ids.contains(tag.getId()));
        recordActivity(issue, "Tags removed", getCurrentUser().getId());
        return mapToResponse(issueRepository.save(issue));
    }

    @Override
    @Transactional
    public IssueResponseDTO addWatchers(Long id, Set<Long> userIds) {
        IssueEntity issue = getAccessibleIssue(id);
        addWatchersInternal(issue, issue.getProject(), userIds, getCurrentUser().getId(), true);
        return mapToResponse(issue);
    }

    @Override
    @Transactional
    public IssueResponseDTO removeWatchers(Long id, Set<Long> userIds) {
        IssueEntity issue = getAccessibleIssue(id);
        Set<Long> ids = validateIdSet(userIds, "User IDs cannot be empty");

        List<IssueWatcherEntity> existing = issueWatcherRepository.findAllByIssue_IdAndWatcher_IdIn(issue.getId(), ids);
        if (existing.size() != ids.size()) {
            throw new IllegalStateException("One or more users are not watching this issue");
        }

        issueWatcherRepository.deleteByIssue_IdAndWatcher_IdIn(issue.getId(), ids);
        recordActivity(issue, "Watchers removed", getCurrentUser().getId());
        return mapToResponse(issue);
    }

    @Override
    @Transactional
    public void deleteIssue(Long id) {
        IssueEntity issue = getAccessibleIssue(id);
        issueRepository.delete(issue);
    }

    private IssueEntity getAccessibleIssue(Long id) {
        IssueEntity issue = issueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found"));
        getAccessibleProject(issue.getProject().getId());
        return issue;
    }

    private ProjectEntity getAccessibleProject(Long projectId) {
        if (projectId == null) {
            throw new IllegalArgumentException("Project ID is required");
        }
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        if (!canAccessProject(project)) {
            throw new AccessDeniedException("You do not have access to this project");
        }
        return project;
    }

    private boolean canAccessProject(ProjectEntity project) {
        UserEntity currentUser = getCurrentUser();
        boolean isOwner = project.getOwner() != null && project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = projectMembershipRepository.existsByProject_IdAndUser_Id(project.getId(), currentUser.getId());
        return isOwner || isMember || isAdmin();
    }

    private void updateAssignee(IssueEntity issue, Long assigneeId, Long currentUserId) {
        UserEntity resolvedAssignee = resolveOptionalProjectUser(issue.getProject(), assigneeId);
        Long currentAssigneeId = issue.getAssignee() == null ? null : issue.getAssignee().getId();
        Long resolvedAssigneeId = resolvedAssignee == null ? null : resolvedAssignee.getId();
        if (!Objects.equals(currentAssigneeId, resolvedAssigneeId)) {
            recordActivity(issue, "Assignee changed from " + currentAssigneeId + " to " + resolvedAssigneeId, currentUserId);
        }
        issue.setAssignee(resolvedAssignee);
    }

    private UserEntity resolveOptionalProjectUser(ProjectEntity project, Long userId) {
        if (userId == null) {
            return null;
        }
        validateUsersExist(Set.of(userId));
        validateProjectUsers(project, Set.of(userId));
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private void replaceWatchers(IssueEntity issue, Set<Long> watcherIds, Long currentUserId) {
        Set<Long> incoming = watcherIds == null ? Set.of() : watcherIds;
        if (incoming.contains(null)) {
            throw new IllegalArgumentException("IDs cannot contain null");
        }
        validateUsersExist(incoming);
        validateProjectUsers(issue.getProject(), incoming);

        Set<Long> existing = issueWatcherRepository.findAllByIssue_IdOrderByCreatedAtDesc(issue.getId())
                .stream()
                .map(watcher -> watcher.getWatcher().getId())
                .collect(Collectors.toSet());

        Set<Long> toRemove = existing.stream()
                .filter(id -> !incoming.contains(id))
                .collect(Collectors.toSet());
        Set<Long> toAdd = incoming.stream()
                .filter(id -> !existing.contains(id))
                .collect(Collectors.toSet());

        if (!toRemove.isEmpty()) {
            issueWatcherRepository.deleteByIssue_IdAndWatcher_IdIn(issue.getId(), toRemove);
        }
        if (!toAdd.isEmpty()) {
            addWatchersInternal(issue, issue.getProject(), toAdd, currentUserId, false);
        }
        if (!toRemove.isEmpty() || !toAdd.isEmpty()) {
            recordActivity(issue, "Watchers replaced", currentUserId);
        }
    }

    private void addWatchersInternal(IssueEntity issue, ProjectEntity project, Set<Long> userIds, Long currentUserId, boolean failOnExisting) {
        Set<Long> ids = validateIdSet(userIds, "User IDs cannot be empty");
        validateUsersExist(ids);
        validateProjectUsers(project, ids);

        Set<Long> existingIds = issueWatcherRepository.findAllByIssue_IdAndWatcher_IdIn(issue.getId(), ids)
                .stream()
                .map(watcher -> watcher.getWatcher().getId())
                .collect(Collectors.toSet());
        if (failOnExisting && !existingIds.isEmpty()) {
            throw new IllegalStateException("One or more users are already watching this issue");
        }

        List<UserEntity> users = userRepository.findAllById(ids.stream()
                .filter(id -> !existingIds.contains(id))
                .toList());
        for (UserEntity user : users) {
            IssueWatcherEntity watcher = new IssueWatcherEntity();
            watcher.setIssue(issue);
            watcher.setWatcher(user);
            issueWatcherRepository.save(watcher);
        }
        if (!users.isEmpty()) {
            recordActivity(issue, "Watchers added", currentUserId);
        }
    }

    private void validateUsersExist(Collection<Long> userIds) {
        if (userIds.isEmpty()) {
            return;
        }
        List<UserEntity> users = userRepository.findAllById(userIds);
        if (users.size() != userIds.size()) {
            throw new EntityNotFoundException("One or more users were not found");
        }
    }

    private void validateProjectUsers(ProjectEntity project, Collection<Long> userIds) {
        Set<Long> allowedUserIds = projectMembershipRepository.findAllByProject_Id(project.getId())
                .stream()
                .map(membership -> membership.getUser().getId())
                .collect(Collectors.toSet());
        if (project.getOwner() != null) {
            allowedUserIds.add(project.getOwner().getId());
        }

        List<Long> invalid = userIds.stream()
                .filter(id -> !allowedUserIds.contains(id))
                .toList();
        if (!invalid.isEmpty() && !isAdmin()) {
            throw new AccessDeniedException("Only project members can be assigned or added as watchers");
        }
    }

    private Set<IssueTagEntity> fetchTags(Set<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new HashSet<>();
        }
        List<IssueTagEntity> tags = issueTagRepository.findAllById(tagIds);
        if (tags.size() != tagIds.size()) {
            throw new EntityNotFoundException("One or more tags were not found");
        }
        return new HashSet<>(tags);
    }

    private void recordActivity(IssueEntity issue, String activity, Long userId) {
        IssueActivityEntity entry = new IssueActivityEntity();
        entry.setIssue(issue);
        entry.setActivity(activity);
        entry.setUserId(userId);
        entry.setCreatedAt(Instant.now());
        issueActivityRepository.save(entry);
    }

    private IssueStatus parseStatus(String status) {
        return IssueStatus.valueOf(requiredTrim(status, "Status is required").toUpperCase());
    }

    private IssueType parseType(String type) {
        return IssueType.valueOf(requiredTrim(type, "Type is required").toUpperCase());
    }

    private IssueSeverity parseSeverity(String severity) {
        return IssueSeverity.valueOf(requiredTrim(severity, "Severity is required").toUpperCase());
    }

    private IssuePriority parsePriority(String priority) {
        return IssuePriority.valueOf(requiredTrim(priority, "Priority is required").toUpperCase());
    }

    private Set<Long> validateIdSet(Set<Long> ids, String emptyMessage) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException(emptyMessage);
        }
        if (ids.contains(null)) {
            throw new IllegalArgumentException("IDs cannot contain null");
        }
        return ids;
    }

    private String requiredTrim(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Authenticated user not found");
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> {
                    String value = authority.getAuthority();
                    return value.equals("ADMIN")
                            || value.equals("SUPERADMIN")
                            || value.equals("ROLE_ADMIN")
                            || value.equals("ROLE_SUPERADMIN")
                            || value.equals("ROLE_ROLE_ADMIN")
                            || value.equals("ROLE_ROLE_SUPERADMIN");
                });
    }

    private IssueResponseDTO mapToResponse(IssueEntity issue) {
        IssueResponseDTO dto = new IssueResponseDTO();
        dto.setId(issue.getId());
        dto.setProjectId(issue.getProject().getId());
        dto.setAssigneeId(issue.getAssignee() == null ? null : issue.getAssignee().getId());
        dto.setTitle(issue.getTitle());
        dto.setDescription(issue.getDescription());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setUpdatedAt(issue.getUpdatedAt());
        dto.setDueDate(issue.getDueDate());
        dto.setIsBlocked(issue.getIsBlocked());
        dto.setStatus(issue.getStatus().name());
        dto.setType(issue.getType().name());
        dto.setSeverity(issue.getSeverity().name());
        dto.setPriority(issue.getPriority().name());
        dto.setCreatedById(issue.getCreatedBy().getId());
        dto.setTags(issue.getTags().stream().map(this::mapTag).collect(Collectors.toSet()));
        dto.setWatchers(issueWatcherRepository.findAllByIssue_IdOrderByCreatedAtDesc(issue.getId())
                .stream()
                .map(this::mapWatcher)
                .collect(Collectors.toSet()));
        dto.setComments(issueCommentRepository.findByIssueIdAndDeletedFalseOrderByCreatedAtDesc(issue.getId())
                .stream()
                .map(this::mapComment)
                .toList());
        dto.setAttachments(issueAttachmentRepository.findByIssueIdOrderByCreatedAtDesc(issue.getId())
                .stream()
                .map(this::mapAttachment)
                .toList());
        dto.setActivities(issueActivityRepository.findByIssueIdOrderByCreatedAtDesc(issue.getId())
                .stream()
                .map(this::mapActivity)
                .toList());
        return dto;
    }

    private IssueTagDTO mapTag(IssueTagEntity tag) {
        return IssueTagDTO.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }

    private IssueWatcherDTO mapWatcher(IssueWatcherEntity watcher) {
        return IssueWatcherDTO.builder()
                .id(watcher.getId())
                .userId(watcher.getWatcher().getId())
                .createdAt(watcher.getCreatedAt())
                .build();
    }

    private IssueCommentDTO mapComment(com.example.proman.issue.domain.Entity.IssueCommentEntity comment) {
        return IssueCommentDTO.builder()
                .id(comment.getId())
                .userId(comment.getUserId())
                .content(comment.getComment())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .deleted(comment.isDeleted())
                .build();
    }

    private IssueAttachmentDTO mapAttachment(com.example.proman.issue.domain.Entity.IssueAttachmentEntity attachment) {
        return IssueAttachmentDTO.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileUrl(attachment.getFilePath())
                .cloudinaryPublicId(attachment.getCloudinaryPublicId())
                .contentType(attachment.getContentType())
                .fileSizeBytes(attachment.getFileSizeBytes())
                .userId(attachment.getUserId())
                .createdAt(attachment.getCreatedAt())
                .build();
    }

    private IssueActivityDTO mapActivity(IssueActivityEntity activity) {
        return IssueActivityDTO.builder()
                .id(activity.getId())
                .action(activity.getActivity())
                .performedBy(activity.getUserId())
                .createdAt(activity.getCreatedAt())
                .build();
    }
}
