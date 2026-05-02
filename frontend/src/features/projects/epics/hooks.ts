import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEpicsByProject,
  createEpic,
  getEpicById,
  assignEpicUsers,
  removeEpicUsers,
} from "./api";

export const epicQueryKeys = {
  all: ["epics"] as const,
  byProject: (projectId: string | number) =>
    [...epicQueryKeys.all, "project", projectId] as const,
  detail: (epicId: string | number) =>
    [...epicQueryKeys.all, "detail", epicId] as const,
};

export function useEpicsByProject(projectId?: string | number) {
  return useQuery({
    queryKey: projectId
      ? epicQueryKeys.byProject(projectId)
      : ["epics", "none"],
    queryFn: () => getEpicsByProject(projectId as string | number),
    enabled: !!projectId,
  });
}

export function useCreateEpic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { projectId: string | number; name: string }) =>
      createEpic(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: epicQueryKeys.byProject(variables.projectId),
      });
    },
  });
}

export function useEpicById(epicId?: string | number) {
  return useQuery({
    queryKey: epicId ? epicQueryKeys.detail(epicId) : ["epic", "none"],
    queryFn: () => getEpicById(epicId as string | number),
    enabled: !!epicId,
  });
}

export function useAssignEpicUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      epicId,
      payload,
    }: {
      epicId: string | number;
      payload: { userIds: number[] };
    }) => assignEpicUsers(epicId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: epicQueryKeys.detail(variables.epicId),
      });
    },
  });
}

export function useRemoveEpicUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      epicId,
      payload,
    }: {
      epicId: string | number;
      payload: { userIds: number[] };
    }) => removeEpicUsers(epicId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: epicQueryKeys.detail(variables.epicId),
      });
    },
  });
}
