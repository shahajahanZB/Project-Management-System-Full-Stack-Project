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
    `/v1/projects/${projectId}/issues`,
  );
  return response.data;
}

export async function getIssue(projectId: number, issueId: number) {
  const response = await apiClient.get<Issue>(
    `/v1/projects/${projectId}/issues/${issueId}`,
  );
  return response.data;
}

export async function createProjectIssue(
  projectId: number,
  payload: IssueCreatePayload,
) {
  const response = await apiClient.post<Issue>(
    `/v1/projects/${projectId}/issues`,
    payload,
  );
  return response.data;
}

export async function updateIssue(projectId: number, issueId: number, payload: IssueUpdatePayload) {
  const response = await apiClient.put<Issue>(
    `/v1/projects/${projectId}/issues/${issueId}`,
    payload,
  );
  return response.data;
}

export async function deleteIssue(projectId: number, issueId: number) {
  await apiClient.delete(`/v1/projects/${projectId}/issues/${issueId}`);
}

export async function assignIssueAssignee(
  projectId: number,
  issueId: number,
  assigneeId: number,
) {
  const response = await apiClient.patch<Issue>(
    `/v1/projects/${projectId}/issues/${issueId}/assignee`,
    { assigneeId },
  );
  return response.data;
}

export async function removeIssueAssignee(projectId: number, issueId: number) {
  const response = await apiClient.delete<Issue>(
    `/v1/projects/${projectId}/issues/${issueId}/assignee`,
  );
  return response.data;
}

export async function addIssueWatchers(
  projectId: number,
  issueId: number,
  userIds: number[],
) {
  const response = await apiClient.post<Issue>(
    `/v1/projects/${projectId}/issues/${issueId}/watchers`,
    { userIds },
  );
  return response.data;
}

export async function removeIssueWatchers(
  projectId: number,
  issueId: number,
  userIds: number[],
) {
  const response = await apiClient.delete<Issue>(
    `/v1/projects/${projectId}/issues/${issueId}/watchers`,
    { data: { userIds } },
  );
  return response.data;
}

export async function getIssueTags() {
  const response = await apiClient.get<IssueTag[]>("/v1/issues/tags");
  return response.data;
}

export async function createIssueTag(name: string) {
  const response = await apiClient.post<IssueTag>("/v1/issues/tags", { name });
  return response.data;
}

export async function getIssueComments(projectId: number, issueId: number) {
  const response = await apiClient.get<IssueComment[]>(
    `/v1/projects/${projectId}/issues/${issueId}/comments`,
  );
  return response.data;
}

export async function createIssueComment(
  projectId: number,
  issueId: number,
  content: string,
) {
  const response = await apiClient.post<IssueComment>(
    `/v1/projects/${projectId}/issues/${issueId}/comments`,
    { content },
  );
  return response.data;
}

export async function updateIssueComment(
  projectId: number,
  commentId: number,
  content: string,
) {
  const response = await apiClient.put<IssueComment>(
    `/v1/projects/${projectId}/issues/comments/${commentId}`,
    { content },
  );
  return response.data;
}

export async function deleteIssueComment(
  projectId: number,
  commentId: number,
) {
  await apiClient.delete(
    `/v1/projects/${projectId}/issues/comments/${commentId}`,
  );
}

// Legacy functions kept for backwards compatibility
export async function addIssueComment(issueId: number, content: string) {
  const response = await apiClient.post<IssueComment>(
    `/v1/issues/${issueId}/comments`,
    { content },
  );
  return response.data;
}

export async function uploadIssueAttachment(issueId: number, file: File) {
  const body = new FormData();
  body.append("file", file);

  const response = await apiClient.post<IssueAttachment>(
    `/v1/issues/${issueId}/attachments`,
    body,
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
