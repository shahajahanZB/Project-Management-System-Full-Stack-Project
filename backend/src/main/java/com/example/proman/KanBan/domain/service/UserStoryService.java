package com.example.proman.KanBan.domain.service;

import com.example.proman.KanBan.domain.dto.*;
import com.example.proman.iam.domain.dto.UserRoleResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserStoryService {

    UserStoryResponseDTO createUserStory(UserStoryCreateRequestDTO request);

    List<UserStoryResponseDTO> getUserStoriesByProject(Long projectId);

    List<UserStoryResponseDTO> searchUserStoriesByProject(Long projectId, String query);

    List<UserStoryResponseDTO> getUserStoriesByEpic(Long epicId);

    List<UserRoleResponseDTO> getAssignableUsersByProject(Long projectId);

    UserStoryResponseDTO getUserStoryById(Long storyId);

    UserStoryResponseDTO updateUserStory(Long storyId, UserStoryUpdateRequestDTO request);

    UserStoryResponseDTO updateStatus(Long storyId, UserStoryStatusUpdateRequestDTO request);

    UserStoryResponseDTO updateTimings(Long storyId, UserStoryTimingUpdateRequestDTO request);

    UserStoryResponseDTO assignUsers(Long storyId, UserStoryUsersRequestDTO request);

    UserStoryResponseDTO removeUsers(Long storyId, UserStoryUsersRequestDTO request);

    UserStoryResponseDTO addWatchers(Long storyId, UserStoryUsersRequestDTO request);

    UserStoryResponseDTO removeWatchers(Long storyId, UserStoryUsersRequestDTO request);

    UserStoryResponseDTO addTag(Long storyId, UserStoryTagRequestDTO request);

    UserStoryResponseDTO removeTag(Long storyId, UserStoryTagRequestDTO request);

    UserStoryCommentResponseDTO addComment(Long storyId, UserStoryCommentCreateRequestDTO request);

    UserStoryCommentResponseDTO updateComment(Long storyId, Long commentId, UserStoryCommentUpdateRequestDTO request);

    void deleteComment(Long storyId, Long commentId);

    List<UserStoryCommentResponseDTO> getComments(Long storyId);

    UserStoryAttachmentResponseDTO addAttachment(Long storyId, MultipartFile file, UserStoryAttachmentCreateRequestDTO request);

    List<UserStoryAttachmentResponseDTO> getAttachments(Long storyId);

    void deleteAttachment(Long storyId, Long attachmentId);

    List<UserStoryActivityResponseDTO> getActivities(Long storyId);

    boolean canManageStory(Long storyId);

    boolean canViewStory(Long storyId);
}
