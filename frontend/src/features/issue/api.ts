import { apiClient } from "@/lib/api-client";
import type {
  Issue,
  IssueActivity,
  IssueAttachment,
  IssueComment,
  IssueCreatePayload,
  IssueTag,
  IssueUpdatePayload,
} from "./types";

export async function getProjectIssues(projectId: number) {
  const response = await apiClient.get<Issue[]>(
    `/v1/issues/project/${projectId}`,
  );
  return response.data;
}

export async function getIssue(issueId: number) {
  const response = await apiClient.get<Issue>(`/v1/issues/${issueId}`);
  return response.data;
}

export async function createProjectIssue(
  projectId: number,
  payload: IssueCreatePayload,
) {
  const response = await apiClient.post<Issue>(
    `/v1/issues/project/${projectId}`,
    payload,
  );
  return response.data;
}

export async function updateIssue(issueId: number, payload: IssueUpdatePayload) {
  const response = await apiClient.put<Issue>(`/v1/issues/${issueId}`, payload);
  return response.data;
}

export async function deleteIssue(issueId: number) {
  await apiClient.delete(`/v1/issues/${issueId}`);
}

export async function getIssueTags() {
  const response = await apiClient.get<IssueTag[]>("/v1/issues/tags");
  return response.data;
}

export async function createIssueTag(name: string) {
  const response = await apiClient.post<IssueTag>("/v1/issues/tags", { name });
  return response.data;
}

export async function addIssueComment(issueId: number, content: string) {
  const response = await apiClient.post<IssueComment>(
    `/v1/issues/${issueId}/comments`,
    { content },
  );
  return response.data;
}

export async function updateIssueComment(commentId: number, content: string) {
  const response = await apiClient.put<IssueComment>(
    `/v1/issues/comments/${commentId}`,
    { content },
  );
  return response.data;
}

export async function deleteIssueComment(commentId: number) {
  await apiClient.delete(`/v1/issues/comments/${commentId}`);
}

export async function uploadIssueAttachment(issueId: number, file: File) {
  const body = new FormData();
  body.append("file", file);

  const response = await apiClient.post<IssueAttachment>(
    `/v1/issues/${issueId}/attachments`,
    body,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

export async function deleteIssueAttachment(attachmentId: number) {
  await apiClient.delete(`/v1/issues/attachments/${attachmentId}`);
}

export async function getIssueActivities(issueId: number) {
  const response = await apiClient.get<IssueActivity[]>(
    `/v1/issues/${issueId}/activities`,
  );
  return response.data;
}
