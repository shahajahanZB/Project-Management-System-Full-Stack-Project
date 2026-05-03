import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTagToStory,
  addUserStoryAttachment,
  addUserStoryComment,
  addWatchersToStory,
  assignUsersToStory,
  createUserStory,
  createUserStoryStatus,
  deleteUserStoryAttachment,
  deleteUserStoryComment,
  deleteUserStoryStatus,
  getAssignableUsersForProject,
  getUserStoriesByEpic,
  getUserStoriesByProject,
  getUserStory,
  getUserStoryActivities,
  getUserStoryAttachments,
  getUserStoryComments,
  getUserStoryStatusesByProject,
  removeTagFromStory,
  removeUsersFromStory,
  removeWatchersFromStory,
  updateUserStory,
  updateUserStoryComment,
  updateUserStoryStatus,
  updateUserStoryTiming,
} from "./api";
import type {
  CreateUserStoryPayload,
  CreateUserStoryStatusPayload,
  UpdateUserStoryPayload,
  UpdateUserStoryStatusPayload,
  UpdateUserStoryTimingPayload,
  UserIdsPayload,
  UserStoryTagPayload,
} from "./types";

export const kanbanQueryKeys = {
  statuses: (projectId?: string | number) =>
    ["kanban", "statuses", projectId ?? "none"] as const,
  stories: (projectId?: string | number) =>
    ["kanban", "stories", projectId ?? "none"] as const,
  story: (storyId?: string | number) =>
    ["kanban", "story", storyId ?? "none"] as const,
  assignableUsers: (projectId?: string | number) =>
    ["kanban", "assignable-users", projectId ?? "none"] as const,
  epicStories: (epicId?: string | number) =>
    ["kanban", "epic-stories", epicId ?? "none"] as const,
  comments: (storyId?: string | number) =>
    ["kanban", "comments", storyId ?? "none"] as const,
  attachments: (storyId?: string | number) =>
    ["kanban", "attachments", storyId ?? "none"] as const,
  activities: (storyId?: string | number) =>
    ["kanban", "activities", storyId ?? "none"] as const,
};

export function useUserStoryStatuses(projectId?: string | number) {
  return useQuery({
    queryKey: kanbanQueryKeys.statuses(projectId),
    queryFn: () => getUserStoryStatusesByProject(projectId as string | number),
    enabled: !!projectId,
  });
}

export function useCreateUserStoryStatus(projectId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserStoryStatusPayload) =>
      createUserStoryStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.statuses(projectId),
      });
    },
  });
}

export function useDeleteUserStoryStatus(projectId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusId: string | number) => deleteUserStoryStatus(statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.statuses(projectId),
      });
    },
  });
}

export function useUserStoriesByProject(projectId?: string | number) {
  return useQuery({
    queryKey: kanbanQueryKeys.stories(projectId),
    queryFn: () => getUserStoriesByProject(projectId as string | number),
    enabled: !!projectId,
  });
}

export function useAssignableUsersForProject(projectId?: string | number) {
  return useQuery({
    queryKey: kanbanQueryKeys.assignableUsers(projectId),
    queryFn: () => getAssignableUsersForProject(projectId as string | number),
    enabled: !!projectId,
  });
}

export function useUserStoriesByEpic(epicId?: string | number) {
  return useQuery({
    queryKey: kanbanQueryKeys.epicStories(epicId),
    queryFn: () => getUserStoriesByEpic(epicId as string | number),
    enabled: !!epicId,
  });
}

export function useUserStory(storyId?: string | number) {
  return useQuery({
    queryKey: kanbanQueryKeys.story(storyId),
    queryFn: () => getUserStory(storyId as string | number),
    enabled: !!storyId,
  });
}

export function useCreateUserStory(projectId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserStoryPayload) => createUserStory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.stories(projectId),
      });
    },
  });
}

export function useUpdateUserStory(projectId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      payload,
    }: {
      storyId: string | number;
      payload: UpdateUserStoryPayload;
    }) => updateUserStory(storyId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.stories(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.story(variables.storyId),
      });
    },
  });
}

export function useUpdateUserStoryStatus(projectId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      payload,
    }: {
      storyId: string | number;
      payload: UpdateUserStoryStatusPayload;
    }) => updateUserStoryStatus(storyId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.stories(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.story(variables.storyId),
      });
    },
  });
}

export function useUpdateUserStoryTiming() {
  return useMutation({
    mutationFn: ({
      storyId,
      payload,
    }: {
      storyId: string | number;
      payload: UpdateUserStoryTimingPayload;
    }) => updateUserStoryTiming(storyId, payload),
  });
}

export function useAssignUsersToStory(projectId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      payload,
    }: {
      storyId: string | number;
      payload: UserIdsPayload;
    }) => assignUsersToStory(storyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.stories(projectId),
      });
    },
  });
}

export function useRemoveUsersFromStory(projectId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      payload,
    }: {
      storyId: string | number;
      payload: UserIdsPayload;
    }) => removeUsersFromStory(storyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.stories(projectId),
      });
    },
  });
}

export function useAddWatchersToStory() {
  return useMutation({
    mutationFn: ({
      storyId,
      payload,
    }: {
      storyId: string | number;
      payload: UserIdsPayload;
    }) => addWatchersToStory(storyId, payload),
  });
}

export function useRemoveWatchersFromStory() {
  return useMutation({
    mutationFn: ({
      storyId,
      payload,
    }: {
      storyId: string | number;
      payload: UserIdsPayload;
    }) => removeWatchersFromStory(storyId, payload),
  });
}

export function useAddTagToStory(projectId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      payload,
    }: {
      storyId: string | number;
      payload: UserStoryTagPayload;
    }) => addTagToStory(storyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.stories(projectId),
      });
    },
  });
}

export function useRemoveTagFromStory(projectId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      payload,
    }: {
      storyId: string | number;
      payload: UserStoryTagPayload;
    }) => removeTagFromStory(storyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.stories(projectId),
      });
    },
  });
}

export function useUserStoryComments(storyId?: string | number) {
  return useQuery({
    queryKey: kanbanQueryKeys.comments(storyId),
    queryFn: () => getUserStoryComments(storyId as string | number),
    enabled: !!storyId,
  });
}

export function useAddUserStoryComment(storyId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { comment: string }) =>
      addUserStoryComment(storyId as string | number, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.comments(storyId),
      });
    },
  });
}

export function useUpdateUserStoryComment(storyId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string | number;
      payload: { comment: string };
    }) => updateUserStoryComment(storyId as string | number, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.comments(storyId),
      });
    },
  });
}

export function useDeleteUserStoryComment(storyId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string | number) =>
      deleteUserStoryComment(storyId as string | number, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.comments(storyId),
      });
    },
  });
}

export function useUserStoryAttachments(storyId?: string | number) {
  return useQuery({
    queryKey: kanbanQueryKeys.attachments(storyId),
    queryFn: () => getUserStoryAttachments(storyId as string | number),
    enabled: !!storyId,
  });
}

export function useAddUserStoryAttachment(storyId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId: storyIdFromVariables,
      file,
      metadata,
    }: {
      storyId?: string | number;
      file: File;
      metadata: { description?: string };
    }) =>
      addUserStoryAttachment(
        (storyIdFromVariables ?? storyId) as string | number,
        file,
        metadata,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.attachments(storyId),
      });
    },
  });
}

export function useDeleteUserStoryAttachment(storyId?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string | number) =>
      deleteUserStoryAttachment(storyId as string | number, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.attachments(storyId),
      });
    },
  });
}

export function useUserStoryActivities(storyId?: string | number) {
  return useQuery({
    queryKey: kanbanQueryKeys.activities(storyId),
    queryFn: () => getUserStoryActivities(storyId as string | number),
    enabled: !!storyId,
  });
}
