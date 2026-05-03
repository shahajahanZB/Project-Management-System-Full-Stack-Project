export type KanbanPointKey = "ux" | "design" | "frontend" | "backend";

export type KanbanPoints = Record<KanbanPointKey, number>;

export type KanbanColumn = {
  id: string;
  statusId?: number;
  title: string;
  color: string;
  sortOrder: number;
};

export type KanbanTag = {
  id: string;
  label: string;
  color: string;
};

export type KanbanUser = {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
};

export type KanbanAttachment = {
  id: string;
  attachmentId?: number;
  name: string;
  size: number;
  file?: File;
};

export type KanbanCard = {
  id: string;
  storyId?: number;
  epicId?: number | null;
  statusId?: number | null;
  title: string;
  description: string;
  columnId: string;
  assigneeId: string | null;
  tagIds: string[];
  points: KanbanPoints;
  attachments: KanbanAttachment[];
  updatedAt: string;
};

export type KanbanDraft = {
  title: string;
  description: string;
  epicId?: number | null;
  columnId: string;
  assigneeId: string | null;
  tagIds: string[];
  points: KanbanPoints;
  attachments: KanbanAttachment[];
};

export type UserStoryStatus = {
  id: number;
  projectId: number;
  name: string;
  sortOrder: number;
};

export type CreateUserStoryStatusPayload = {
  projectId: number;
  name: string;
  sortOrder: number;
};

export type UserStory = {
  id: number;
  projectId: number;
  epicId?: number | null;
  statusId?: number | null;
  title: string;
  description: string;
  assignees: KanbanUser[];
  tags: KanbanTag[];
  attachments: KanbanAttachment[];
  updatedAt?: string;
};

export type CreateUserStoryPayload = {
  projectId: number;
  epicId?: number | null;
  statusId?: number | null;
  title: string;
  description: string;
};

export type UpdateUserStoryPayload = {
  title?: string;
  description?: string;
  epicId?: number | null;
};

export type UpdateUserStoryStatusPayload = {
  statusId: number;
};

export type UpdateUserStoryTimingPayload = {
  endDate: string;
};

export type UserIdsPayload = {
  userIds: number[];
};

export type UserStoryTagPayload = {
  name: string;
};

export type UserStoryComment = {
  id: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserStoryActivity = {
  id: number;
  message?: string;
  action?: string;
  createdAt?: string;
};
