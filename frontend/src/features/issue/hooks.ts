import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addIssueComment,
  addIssueWatchers,
  createIssueComment,
  createIssueTag,
  createProjectIssue,
  deleteIssue,
  deleteIssueAttachment,
  deleteIssueComment,
  getIssue,
  getIssueComments,
  getIssueTags,
  getProjectIssues,
  removeIssueWatchers,
  updateIssue,
  updateIssueComment,
  uploadIssueAttachment,
  assignIssueAssignee,
  removeIssueAssignee,
} from "./api";
import type { IssueCreatePayload, IssueUpdatePayload } from "./types";

export const issueQueryKeys = {
  all: ["issues"] as const,
  projectList: (projectId: number) =>
    [...issueQueryKeys.all, "project", projectId] as const,
  detail: (issueId: number) => [...issueQueryKeys.all, "detail", issueId] as const,
  comments: (issueId: number) => [...issueQueryKeys.all, "comments", issueId] as const,
  tags: () => [...issueQueryKeys.all, "tags"] as const,
};

export function useProjectIssues(projectId: number, enabled = true) {
  return useQuery({
    queryKey: issueQueryKeys.projectList(projectId),
    queryFn: () => getProjectIssues(projectId),
    enabled,
  });
}

export function useIssue(projectId: number | undefined, issueId: number, enabled = true) {
  return useQuery({
    queryKey: issueQueryKeys.detail(issueId),
    queryFn: () => getIssue(projectId as number, issueId),
    enabled: enabled && typeof projectId === "number",
  });
}

export function useGetIssueComments(projectId: number | undefined, issueId: number, enabled = true) {
  return useQuery({
    queryKey: issueQueryKeys.comments(issueId),
    queryFn: () => getIssueComments(projectId as number, issueId),
    enabled: enabled && typeof projectId === "number",
  });
}

export function useIssueTags() {
  return useQuery({
    queryKey: issueQueryKeys.tags(),
    queryFn: getIssueTags,
  });
}

export function useCreateIssueMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IssueCreatePayload) =>
      createProjectIssue(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.projectList(projectId),
      });
    },
  });
}

export function useUpdateIssueMutation(projectId: number, issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IssueUpdatePayload) => updateIssue(projectId, issueId, payload),
    onSuccess: (issue) => {
      queryClient.setQueryData(issueQueryKeys.detail(issueId), issue);
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.projectList(projectId),
      });
    },
  });
}

export function useDeleteIssueMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: number) => deleteIssue(projectId, issueId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.projectList(projectId),
      });
    },
  });
}

export function useCreateIssueTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIssueTag,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: issueQueryKeys.tags() });
    },
  });
}

export function useAddIssueCommentMutation(projectId: number, issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => createIssueComment(projectId, issueId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.comments(issueId),
      });
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useUpdateIssueCommentMutation(projectId: number, issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateIssueComment(projectId, commentId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.comments(issueId),
      });
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useDeleteIssueCommentMutation(projectId: number, issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) =>
      deleteIssueComment(projectId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.comments(issueId),
      });
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useUploadIssueAttachmentMutation(issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadIssueAttachment(issueId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useDeleteIssueAttachmentMutation(issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIssueAttachment,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useAssignIssueAssigneeMutation(projectId: number, issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assigneeId: number) => assignIssueAssignee(projectId, issueId, assigneeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useRemoveIssueAssigneeMutation(projectId: number, issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeIssueAssignee(projectId, issueId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useAddIssueWatchersMutation(projectId: number, issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: number[]) => addIssueWatchers(projectId, issueId, userIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useRemoveIssueWatchersMutation(projectId: number, issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: number[]) => removeIssueWatchers(projectId, issueId, userIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}
