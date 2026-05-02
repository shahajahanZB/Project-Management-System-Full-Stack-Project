package com.example.proman.KanBan.domain.controller;

import com.example.proman.KanBan.domain.dto.UserStoryActivityResponseDTO;
import com.example.proman.KanBan.domain.dto.UserStoryAttachmentCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryAttachmentResponseDTO;
import com.example.proman.KanBan.domain.dto.UserStoryCommentCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryCommentUpdateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryCommentResponseDTO;
import com.example.proman.KanBan.domain.dto.UserStoryCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryResponseDTO;
import com.example.proman.KanBan.domain.dto.UserStoryStatusUpdateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryTimingUpdateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryTagRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryUpdateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryUsersRequestDTO;
import com.example.proman.KanBan.domain.service.UserStoryService;
import com.example.proman.iam.domain.dto.UserRoleResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-stories")
@RequiredArgsConstructor
public class UserStoryController {

    private final UserStoryService userStoryService;

    @PostMapping
    @PreAuthorize("hasAuthority('STORY_CREATE')")
    public ResponseEntity<UserStoryResponseDTO> createUserStory(@Valid @RequestBody UserStoryCreateRequestDTO request) {
        return ResponseEntity.ok(userStoryService.createUserStory(request));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAuthority('STORY_VIEW')")
    public ResponseEntity<List<UserStoryResponseDTO>> getUserStoriesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(userStoryService.getUserStoriesByProject(projectId));
    }

    @GetMapping("/project/{projectId}/assignable-users")
    @PreAuthorize("hasAuthority('STORY_MANAGE')")
    public ResponseEntity<List<UserRoleResponseDTO>> getAssignableUsersByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(userStoryService.getAssignableUsersByProject(projectId));
    }

    @GetMapping("/epic/{epicId}")
    @PreAuthorize("hasAuthority('STORY_VIEW')")
    public ResponseEntity<List<UserStoryResponseDTO>> getUserStoriesByEpic(@PathVariable Long epicId) {
        return ResponseEntity.ok(userStoryService.getUserStoriesByEpic(epicId));
    }

    @GetMapping("/{storyId}")
    @PreAuthorize("hasAuthority('STORY_VIEW')")
    public ResponseEntity<UserStoryResponseDTO> getUserStoryById(@PathVariable Long storyId) {
        return ResponseEntity.ok(userStoryService.getUserStoryById(storyId));
    }

    @PatchMapping("/{storyId}")
    @PreAuthorize("hasAuthority('STORY_MANAGE')")
    public ResponseEntity<UserStoryResponseDTO> updateUserStory(
            @PathVariable Long storyId,
            @RequestBody UserStoryUpdateRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.updateUserStory(storyId, request));
    }

    @PatchMapping("/{storyId}/status")
    @PreAuthorize("hasAuthority('STORY_UPDATE_STATUS')")
    public ResponseEntity<UserStoryResponseDTO> updateStatus(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryStatusUpdateRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.updateStatus(storyId, request));
    }

    @PatchMapping("/{storyId}/timing")
    @PreAuthorize("hasAuthority('STORY_SET_TIMINGS')")
    public ResponseEntity<UserStoryResponseDTO> updateTimings(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryTimingUpdateRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.updateTimings(storyId, request));
    }

    @PostMapping("/{storyId}/assignees")
    @PreAuthorize("hasAuthority('STORY_MANAGE')")
    public ResponseEntity<UserStoryResponseDTO> assignUsers(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryUsersRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.assignUsers(storyId, request));
    }

    @DeleteMapping("/{storyId}/assignees")
    @PreAuthorize("hasAuthority('STORY_MANAGE')")
    public ResponseEntity<UserStoryResponseDTO> removeUsers(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryUsersRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.removeUsers(storyId, request));
    }

    @PostMapping("/{storyId}/watchers")
    @PreAuthorize("hasAuthority('STORY_MANAGE')")
    public ResponseEntity<UserStoryResponseDTO> addWatchers(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryUsersRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.addWatchers(storyId, request));
    }

    @DeleteMapping("/{storyId}/watchers")
    @PreAuthorize("hasAuthority('STORY_MANAGE')")
    public ResponseEntity<UserStoryResponseDTO> removeWatchers(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryUsersRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.removeWatchers(storyId, request));
    }

    @PostMapping("/{storyId}/tags")
    @PreAuthorize("hasAuthority('STORY_MANAGE')")
    public ResponseEntity<UserStoryResponseDTO> addTag(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryTagRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.addTag(storyId, request));
    }

    @DeleteMapping("/{storyId}/tags")
    @PreAuthorize("hasAuthority('STORY_MANAGE')")
    public ResponseEntity<UserStoryResponseDTO> removeTag(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryTagRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.removeTag(storyId, request));
    }

    @PostMapping("/{storyId}/comments")
    @PreAuthorize("hasAuthority('STORY_COMMENT')")
    public ResponseEntity<UserStoryCommentResponseDTO> addComment(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryCommentCreateRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.addComment(storyId, request));
    }

    @PatchMapping("/{storyId}/comments/{commentId}")
    @PreAuthorize("hasAuthority('STORY_COMMENT')")
    public ResponseEntity<UserStoryCommentResponseDTO> updateComment(
            @PathVariable Long storyId,
            @PathVariable Long commentId,
            @Valid @RequestBody UserStoryCommentUpdateRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.updateComment(storyId, commentId, request));
    }

    @DeleteMapping("/{storyId}/comments/{commentId}")
    @PreAuthorize("hasAuthority('STORY_COMMENT')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long storyId,
            @PathVariable Long commentId
    ) {
        userStoryService.deleteComment(storyId, commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{storyId}/comments")
    @PreAuthorize("hasAuthority('STORY_VIEW')")
    public ResponseEntity<List<UserStoryCommentResponseDTO>> getComments(@PathVariable Long storyId) {
        return ResponseEntity.ok(userStoryService.getComments(storyId));
    }

    @PostMapping(value = "/{storyId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('STORY_ATTACHMENT')")
    public ResponseEntity<UserStoryAttachmentResponseDTO> addAttachment(
            @PathVariable Long storyId,
            @RequestPart("file") MultipartFile file,
            @Valid @RequestPart("metadata") UserStoryAttachmentCreateRequestDTO request
    ) {
        return ResponseEntity.ok(userStoryService.addAttachment(storyId, file, request));
    }

    @GetMapping("/{storyId}/attachments")
    @PreAuthorize("hasAuthority('STORY_VIEW')")
    public ResponseEntity<List<UserStoryAttachmentResponseDTO>> getAttachments(@PathVariable Long storyId) {
        return ResponseEntity.ok(userStoryService.getAttachments(storyId));
    }

    @DeleteMapping("/{storyId}/attachments/{attachmentId}")
    @PreAuthorize("hasAuthority('STORY_ATTACHMENT')")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long storyId,
            @PathVariable Long attachmentId
    ) {
        userStoryService.deleteAttachment(storyId, attachmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{storyId}/activities")
    @PreAuthorize("hasAuthority('STORY_VIEW')")
    public ResponseEntity<List<UserStoryActivityResponseDTO>> getActivities(@PathVariable Long storyId) {
        return ResponseEntity.ok(userStoryService.getActivities(storyId));
    }
}
