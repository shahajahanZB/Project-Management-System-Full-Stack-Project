import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  createProject,
  getProject,
  getProjectMembers,
  addProjectMembers,
  removeProjectMembers,
} from "./api";

export const projectQueryKeys = {
  all: ["projects"] as const,
  lists: () => [...projectQueryKeys.all, "list"] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectQueryKeys.lists(),
    queryFn: getProjects,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      createProject(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectQueryKeys.lists() });
    },
  });
}

export function useProject(projectId?: string | number) {
  return useQuery({
    queryKey: projectId ? ["project", projectId] : ["project", "none"],
    queryFn: () => getProject(projectId as string | number),
    enabled: !!projectId,
  });
}

export function useProjectMembers(projectId?: string | number) {
  return useQuery({
    queryKey: projectId
      ? ["project", projectId, "members"]
      : ["project", "none", "members"],
    queryFn: () => getProjectMembers(projectId as string | number),
    enabled: !!projectId,
  });
}

export function useAddProjectMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string | number;
      payload: { userIds: number[] };
    }) => addProjectMembers(projectId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["project", variables.projectId, "members"],
      });
    },
  });
}

export function useRemoveProjectMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string | number;
      payload: { userIds: number[] };
    }) => removeProjectMembers(projectId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["project", variables.projectId, "members"],
      });
    },
  });
}
