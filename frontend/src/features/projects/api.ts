import { apiClient } from '@/lib/api-client';
import type { Project } from './types';

export async function getProjects() {
  const response = await apiClient.get<Project[]>('/projects');
  return response.data;
}
