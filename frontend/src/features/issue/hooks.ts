import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addIssueComment,
  createIssueTag,
  createProjectIssue,
  deleteIssue,
  deleteIssueAttachment,
  deleteIssueComment,
  getIssue,
  getIssueTags,
  getProjectIssues,
  updateIssue,
  updateIssueComment,
  uploadIssueAttachment,
} from "./api";
import type { IssueCreatePayload, IssueUpdatePayload } from "./types";

export const issueQueryKeys = {
  all: ["issues"] as const,
  projectList: (projectId: number) =>
    [...issueQueryKeys.all, "project", projectId] as const,
  detail: (issueId: number) => [...issueQueryKeys.all, "detail", issueId] as const,
  tags: () => [...issueQueryKeys.all, "tags"] as const,
};

export function useProjectIssues(projectId: number, enabled = true) {
  return useQuery({
    queryKey: issueQueryKeys.projectList(projectId),
    queryFn: () => getProjectIssues(projectId),
    enabled,
  });
}

export function useIssue(issueId: number, enabled = true) {
  return useQuery({
    queryKey: issueQueryKeys.detail(issueId),
    queryFn: () => getIssue(issueId),
    enabled,
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

export function useUpdateIssueMutation(projectId: number | undefined, issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IssueUpdatePayload) => updateIssue(issueId, payload),
    onSuccess: (issue) => {
      queryClient.setQueryData(issueQueryKeys.detail(issueId), issue);
      if (projectId) {
        void queryClient.invalidateQueries({
          queryKey: issueQueryKeys.projectList(projectId),
        });
      }
    },
  });
}

export function useDeleteIssueMutation(projectId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIssue,
    onSuccess: () => {
      if (projectId) {
        void queryClient.invalidateQueries({
          queryKey: issueQueryKeys.projectList(projectId),
        });
      }
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

export function useAddIssueCommentMutation(issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => addIssueComment(issueId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useUpdateIssueCommentMutation(issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateIssueComment(commentId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
    },
  });
}

export function useDeleteIssueCommentMutation(issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIssueComment,
    onSuccess: () => {
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
