export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export type Project = {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  ownerName: string;
  taskCount: number;
  updatedAt: string;
};
