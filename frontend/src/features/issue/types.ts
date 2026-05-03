export type IssueStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "READY_FOR_TEST"
  | "CLOSED"
  | "NEEDS_INFO"
  | "REJECTED"
  | "POSTPONED";

export type IssueType = "BUG" | "QUESTION" | "ENHANCEMENT";

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IssueSeverity =
  | "OPTIONAL"
  | "MINOR"
  | "NORMAL"
  | "IMPORTANT"
  | "CRITICAL";

export type IssueTag = {
  id: number;
  name: string;
};

export type IssueWatcher = {
  id: number;
  userId: number;
  createdAt?: string;
};

export type IssueComment = {
  id: number;
  userId: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
};

export type IssueAttachment = {
  id: number;
  fileName: string;
  fileUrl?: string;
  cloudinaryPublicId?: string;
  contentType?: string;
  fileSizeBytes?: number;
  userId?: number;
  createdAt?: string;
};

export type IssueActivity = {
  id: number;
  action: string;
  performedBy?: number;
  createdAt?: string;
};

export type Issue = {
  id: number;
  projectId: number;
  assigneeId: number | null;
  createdById: number;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate: string | null;
  isBlocked: boolean;
  status: IssueStatus;
  type: IssueType;
  severity: IssueSeverity;
  priority: IssuePriority;
  comments?: IssueComment[];
  attachments?: IssueAttachment[];
  activities?: IssueActivity[];
  tags?: IssueTag[];
  watchers?: IssueWatcher[];
};

export type IssueCreatePayload = {
  assigneeId?: number | null;
  title: string;
  description: string;
  dueDate: string;
  isBlocked?: boolean;
  status: IssueStatus;
  type: IssueType;
  severity: IssueSeverity;
  priority: IssuePriority;
  tagIds?: number[];
  watcherIds?: number[];
};

export type IssueUpdatePayload = Partial<
  Omit<IssueCreatePayload, "projectId"> & {
    assigneeId: number | null;
  }
>;

export type IssueUser = {
  id: number;
  username: string;
  email?: string;
  roles?: Array<{ id?: number; name: string } | string>;
};
