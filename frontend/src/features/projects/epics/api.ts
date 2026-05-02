import { apiClient } from "@/lib/api-client";
import type { Epic } from "./types";

export async function getEpicsByProject(projectId: string | number) {
  const response = await apiClient.get<Epic[]>(
    `/v1/epics/project/${projectId}`,
  );
  return response.data;
}

export async function createEpic(payload: {
  projectId: string | number;
  name: string;
}) {
  const response = await apiClient.post<Epic>("/v1/epics", payload);
  return response.data;
}

export async function getEpicById(epicId: string | number) {
  const response = await apiClient.get<Epic>(`/v1/epics/${epicId}`);
  return response.data;
}

export async function assignEpicUsers(
  epicId: string | number,
  payload: { userIds: number[] },
) {
  const response = await apiClient.post(
    `/v1/epics/${epicId}/assignees`,
    payload,
  );
  return response.data;
}

export async function removeEpicUsers(
  epicId: string | number,
  payload: { userIds: number[] },
) {
  const response = await apiClient.delete(`/v1/epics/${epicId}/assignees`, {
    data: payload,
  });
  return response.data;
}
