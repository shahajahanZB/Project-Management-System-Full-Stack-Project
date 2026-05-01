import { useQuery } from '@tanstack/react-query';
import { getProjects } from './api';

export const projectQueryKeys = {
  all: ['projects'] as const,
  lists: () => [...projectQueryKeys.all, 'list'] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectQueryKeys.lists(),
    queryFn: getProjects,
  });
}
