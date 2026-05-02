export type EpicStatus = "NEW" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export interface Epic {
  id: number;
  projectId: number;
  name: string;
  status: EpicStatus;
  progress: number;
  assignedUserIds: number[];
}
