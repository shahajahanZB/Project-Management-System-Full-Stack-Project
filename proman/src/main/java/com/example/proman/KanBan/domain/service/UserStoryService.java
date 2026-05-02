package com.example.proman.KanBan.domain.service;

import com.example.proman.KanBan.domain.dto.*;

import java.util.List;

public interface UserStoryService {

    UserStoryResponseDTO createUserStory(UserStoryCreateRequestDTO request);

    List<UserStoryResponseDTO> getUserStoriesByProject(Long projectId);

    List<UserStoryResponseDTO> getUserStoriesByEpic(Long epicId);

    UserStoryResponseDTO getUserStoryById(Long storyId);

    UserStoryResponseDTO updateStatus(Long storyId, UserStoryStatusUpdateRequestDTO request);

    UserStoryResponseDTO assignUsers(Long storyId, UserStoryUsersRequestDTO request);

    UserStoryResponseDTO removeUsers(Long storyId, UserStoryUsersRequestDTO request);

    UserStoryResponseDTO addWatchers(Long storyId, UserStoryUsersRequestDTO request);

    UserStoryResponseDTO removeWatchers(Long storyId, UserStoryUsersRequestDTO request);

    UserStoryResponseDTO addTag(Long storyId, UserStoryTagRequestDTO request);

    UserStoryResponseDTO removeTag(Long storyId, UserStoryTagRequestDTO request);

    UserStoryCommentResponseDTO addComment(Long storyId, UserStoryCommentCreateRequestDTO request);

    List<UserStoryCommentResponseDTO> getComments(Long storyId);

    UserStoryAttachmentResponseDTO addAttachment(Long storyId, UserStoryAttachmentCreateRequestDTO request);

    List<UserStoryAttachmentResponseDTO> getAttachments(Long storyId);

    List<UserStoryActivityResponseDTO> getActivities(Long storyId);

    boolean canManageStory(Long storyId);

    boolean canViewStory(Long storyId);
}
