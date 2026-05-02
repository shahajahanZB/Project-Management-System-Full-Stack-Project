import { apiClient } from "@/lib/api-client";
import type { Project } from "./types";

export async function getProjects() {
  const response = await apiClient.get<Project[]>("/v1/projects");
  return response.data;
}

export async function createProject(payload: {
  name: string;
  description?: string;
}) {
  const response = await apiClient.post<Project>("/v1/projects", payload);
  return response.data;
}

export async function addProjectMembers(
  projectId: string | number,
  payload: { userIds: number[] },
) {
  const response = await apiClient.post(
    `/v1/projects/${projectId}/members`,
    payload,
  );
  return response.data;
}

export async function getProject(projectId: string | number) {
  const response = await apiClient.get<Project>(`/v1/projects/${projectId}`);
  return response.data;
}

export async function getProjectMembers(projectId: string | number) {
  const response = await apiClient.get<any[]>(
    `/v1/projects/${projectId}/members`,
  );
  return response.data;
}

export async function removeProjectMembers(
  projectId: string | number,
  payload: { userIds: number[] },
) {
  const response = await apiClient.delete(`/v1/projects/${projectId}/members`, {
    data: payload,
  });
  return response.data;
}
