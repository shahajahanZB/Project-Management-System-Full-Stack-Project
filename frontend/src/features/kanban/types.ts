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
  endDate?: string | null;
  attachments: KanbanAttachment[];
  attachmentCount?: number;
  commentCount?: number;
  updatedAt: string;
};

export type KanbanDraft = {
  title: string;
  description: string;
  epicId?: number | null;
  columnId: string;
  assigneeId: string | null;
  tagIds: string[];
  endDate?: string | null;
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
  attachmentCount?: number;
  commentCount?: number;
  activityCount?: number;
  endDate?: string | null;
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
  userStoryId?: number;
  userId?: number | null;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
  modifiedAt?: string;
};

export type UserStoryActivity = {
  id: number;
  userStoryId?: number;
  userId?: number | null;
  username?: string;
  message?: string;
  activity?: string;
  action?: string;
  createdAt?: string;
};

export type StoredBoard = {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  tags: KanbanTag[];
};

export type KanbanModalMode = "create" | "edit";

export type CardModalState = {
  mode: KanbanModalMode;
  cardId?: string;
  storyId?: number;
  draft: KanbanDraft;
};

export type ProjectMemberLike = {
  userId?: string | number;
  id?: string | number;
  username?: string;
  name?: string;
  email?: string;
};

export type StoryAssigneeSync = {
  storyId: number;
  previousAssigneeId: string | null;
  nextAssigneeId: string | null;
};

export type StoryTagSync = {
  storyId: number;
  previousTagIds: string[];
  nextTagIds: string[];
};

export type DragPayload =
  | {
      type: "card";
      cardId: string;
    }
  | {
      type: "column";
      columnId: string;
    };
