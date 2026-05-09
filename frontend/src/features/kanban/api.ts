import { apiClient } from "@/lib/api-client";
import type {
  CreateUserStoryPayload,
  CreateUserStoryStatusPayload,
  KanbanAttachment,
  KanbanTag,
  KanbanUser,
  UpdateUserStoryPayload,
  UpdateUserStoryStatusPayload,
  UpdateUserStoryTimingPayload,
  UserIdsPayload,
  UserStory,
  UserStoryActivity,
  UserStoryComment,
  UserStoryStatus,
  UserStoryTagPayload,
} from "./types";

type StatusResponse = Partial<UserStoryStatus> & {
  statusId?: number;
  userStoryStatusId?: number;
};

function normalizeStatus(status: StatusResponse): UserStoryStatus {
  return {
    id: Number(status.id ?? status.statusId ?? status.userStoryStatusId),
    projectId: Number(status.projectId),
    name: String(status.name ?? ""),
    sortOrder: Number(status.sortOrder ?? 0),
  };
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function asNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function slugifyValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeUser(value: unknown, index: number): KanbanUser {
  if (typeof value === "string" || typeof value === "number") {
    return {
      id: String(value),
      name: `User ${value}`,
      avatarColor: "bg-slate-700",
    };
  }

  const record = asRecord(value);
  const id = String(record.id ?? record.userId ?? index);
  const name = String(
    record.username ?? record.name ?? record.email ?? `User ${index + 1}`,
  );

  return {
    id,
    name,
    email: record.email ? String(record.email) : undefined,
    avatarColor: "bg-slate-700",
  };
}

function normalizeTag(value: unknown, index: number): KanbanTag {
  if (typeof value === "string") {
    return {
      id: slugifyValue(value) || value,
      label: value,
      color: "bg-slate-100 text-slate-700 ring-slate-200",
    };
  }

  const record = asRecord(value);
  const label = String(record.name ?? record.label ?? `Tag ${index + 1}`);
  const id = String(record.id ?? record.name ?? record.label ?? label);
  return {
    id: slugifyValue(id) || id,
    label,
    color: "bg-slate-100 text-slate-700 ring-slate-200",
  };
}

function normalizeAttachment(value: unknown, index: number): KanbanAttachment {
  const record = asRecord(value);
  const attachmentId = asNumber(record.id ?? record.attachmentId);
  return {
    id: String(attachmentId ?? record.id ?? record.attachmentId ?? index),
    attachmentId,
    name: String(
      record.originalFileName ??
        record.fileName ??
        record.name ??
        `Attachment ${index + 1}`,
    ),
    size: Number(record.fileSizeBytes ?? record.size ?? record.fileSize ?? 0),
  };
}

function normalizeStory(value: unknown): UserStory {
  const record = asRecord(value);
  const statusRecord = asRecord(record.status);
  const epicRecord = asRecord(record.epic);
  const id = asNumber(record.id ?? record.storyId ?? record.userStoryId) ?? 0;
  const statusId =
    asNumber(record.statusId ?? statusRecord.id ?? statusRecord.statusId) ??
    null;
  const epicId = asNumber(record.epicId ?? epicRecord.id ?? epicRecord.epicId);
  const assignees = Array.isArray(record.assignees)
    ? record.assignees
    : Array.isArray(record.users)
      ? record.users
      : Array.isArray(record.assignedUserIds)
        ? record.assignedUserIds
        : [];
  const tags = Array.isArray(record.tags)
    ? record.tags
    : Array.isArray(record.tagNames)
      ? record.tagNames
      : [];
  const attachments = Array.isArray(record.attachments)
    ? record.attachments
    : [];

  return {
    id,
    projectId: asNumber(record.projectId) ?? 0,
    epicId: epicId ?? null,
    statusId,
    title: String(record.title ?? ""),
    description: String(record.description ?? ""),
    assignees: assignees.map(normalizeUser),
    tags: tags.map(normalizeTag),
    attachments: attachments.map(normalizeAttachment),
    attachmentCount: asNumber(record.attachmentCount),
    commentCount: asNumber(record.commentCount),
    activityCount: asNumber(record.activityCount),
    endDate: record.endDate ? String(record.endDate) : null,
    updatedAt: record.updatedAt
      ? String(record.updatedAt)
      : record.modifiedDate
        ? String(record.modifiedDate)
        : record.modifiedAt
          ? String(record.modifiedAt)
          : record.createdDate
            ? String(record.createdDate)
            : undefined,
  };
}

export async function createUserStoryStatus(
  payload: CreateUserStoryStatusPayload,
) {
  const response = await apiClient.post<StatusResponse>(
    "/v1/user-story-statuses",
    payload,
  );
  return normalizeStatus(response.data);
}

export async function getUserStoryStatusesByProject(
  projectId: string | number,
) {
  const response = await apiClient.get<StatusResponse[]>(
    `/v1/user-story-statuses/project/${projectId}`,
  );
  return response.data.map(normalizeStatus);
}

export async function deleteUserStoryStatus(statusId: string | number) {
  const response = await apiClient.delete(
    `/v1/user-story-statuses/${statusId}`,
  );
  return response.data;
}

export async function createUserStory(payload: CreateUserStoryPayload) {
  console.log("API: Creating user story with payload:", payload);
  try {
    const response = await apiClient.post<unknown>("/v1/user-stories", payload);
    console.log("API: Story created successfully:", response.data);
    return normalizeStory(response.data);
  } catch (error) {
    console.error("API: Failed to create user story:", error);
    throw error;
  }
}

export async function getUserStoriesByProject(projectId: string | number) {
  const response = await apiClient.get<unknown[]>(
    `/v1/user-stories/project/${projectId}`,
  );
  return response.data.map(normalizeStory);
}

export async function getAssignableUsersForProject(projectId: string | number) {
  const response = await apiClient.get<unknown[]>(
    `/v1/user-stories/project/${projectId}/assignable-users`,
  );
  return response.data.map(normalizeUser);
}

export async function getUserStoriesByEpic(epicId: string | number) {
  const response = await apiClient.get<unknown[]>(
    `/v1/user-stories/epic/${epicId}`,
  );
  return response.data.map(normalizeStory);
}

export async function getUserStory(storyId: string | number) {
  const response = await apiClient.get<unknown>(`/v1/user-stories/${storyId}`);
  return normalizeStory(response.data);
}

export async function updateUserStory(
  storyId: string | number,
  payload: UpdateUserStoryPayload,
) {
  console.log("API: updateUserStory", { storyId, payload });
  try {
    const response = await apiClient.patch<unknown>(
      `/v1/user-stories/${storyId}`,
      payload,
    );
    console.log("API: updateUserStory response", response.data);
    const normalized = normalizeStory(response.data);
    console.log("API: updateUserStory normalized", normalized);
    return normalized;
  } catch (error) {
    console.error("API: updateUserStory error", error);
    throw error;
  }
}

export async function updateUserStoryStatus(
  storyId: string | number,
  payload: UpdateUserStoryStatusPayload,
) {
  console.log("API: Updating user story status", { storyId, payload });
  const response = await apiClient.patch<unknown>(
    `/v1/user-stories/${storyId}/status`,
    payload,
  );
  const normalizedData = normalizeStory(response.data);
  console.log("API: User story status update response", {
    storyId,
    normalizedData,
  });
  return normalizedData;
}

export async function updateUserStoryTiming(
  storyId: string | number,
  payload: UpdateUserStoryTimingPayload,
) {
  const response = await apiClient.patch(
    `/v1/user-stories/${storyId}/timing`,
    payload,
  );
  return response.data;
}

export async function assignUsersToStory(
  storyId: string | number,
  payload: UserIdsPayload,
) {
  const response = await apiClient.post(
    `/v1/user-stories/${storyId}/assignees`,
    payload,
  );
  return response.data;
}

export async function removeUsersFromStory(
  storyId: string | number,
  payload: UserIdsPayload,
) {
  const response = await apiClient.delete(
    `/v1/user-stories/${storyId}/assignees`,
    { data: payload },
  );
  return response.data;
}

export async function addWatchersToStory(
  storyId: string | number,
  payload: UserIdsPayload,
) {
  const response = await apiClient.post(
    `/v1/user-stories/${storyId}/watchers`,
    payload,
  );
  return response.data;
}

export async function removeWatchersFromStory(
  storyId: string | number,
  payload: UserIdsPayload,
) {
  const response = await apiClient.delete(
    `/v1/user-stories/${storyId}/watchers`,
    { data: payload },
  );
  return response.data;
}

export async function addTagToStory(
  storyId: string | number,
  payload: UserStoryTagPayload,
) {
  const response = await apiClient.post(
    `/v1/user-stories/${storyId}/tags`,
    payload,
  );
  return response.data;
}

export async function removeTagFromStory(
  storyId: string | number,
  payload: UserStoryTagPayload,
) {
  const response = await apiClient.delete(`/v1/user-stories/${storyId}/tags`, {
    data: payload,
  });
  return response.data;
}

export async function addUserStoryComment(
  storyId: string | number,
  payload: { comment: string },
) {
  const response = await apiClient.post<UserStoryComment>(
    `/v1/user-stories/${storyId}/comments`,
    payload,
  );
  return response.data;
}

export async function updateUserStoryComment(
  storyId: string | number,
  commentId: string | number,
  payload: { comment: string },
) {
  const response = await apiClient.patch<UserStoryComment>(
    `/v1/user-stories/${storyId}/comments/${commentId}`,
    payload,
  );
  return response.data;
}

export async function deleteUserStoryComment(
  storyId: string | number,
  commentId: string | number,
) {
  const response = await apiClient.delete(
    `/v1/user-stories/${storyId}/comments/${commentId}`,
  );
  return response.data;
}

export async function getUserStoryComments(storyId: string | number) {
  const response = await apiClient.get<UserStoryComment[]>(
    `/v1/user-stories/${storyId}/comments`,
  );
  return response.data;
}

export async function addUserStoryAttachment(
  storyId: string | number,
  file: File,
  metadata: { description?: string },
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );

  const response = await apiClient.post<unknown>(
    `/v1/user-stories/${storyId}/attachments`,
    formData,
  );
  return normalizeAttachment(response.data, 0);
}

export async function getUserStoryAttachments(storyId: string | number) {
  const response = await apiClient.get<unknown[]>(
    `/v1/user-stories/${storyId}/attachments`,
  );
  return response.data.map(normalizeAttachment);
}

export async function deleteUserStoryAttachment(
  storyId: string | number,
  attachmentId: string | number,
) {
  const response = await apiClient.delete(
    `/v1/user-stories/${storyId}/attachments/${attachmentId}`,
  );
  return response.data;
}

export async function getUserStoryActivities(storyId: string | number) {
  const response = await apiClient.get<UserStoryActivity[]>(
    `/v1/user-stories/${storyId}/activities`,
  );
  return response.data;
}
