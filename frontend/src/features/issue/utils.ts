import type {
  Issue,
  IssuePriority,
  IssueSeverity,
  IssueType,
  IssueUser,
} from "./types";

export function getUserName(users: IssueUser[], userId?: number | null) {
  if (!userId) return "Unassigned";
  return users.find((user) => user.id === userId)?.username ?? `User ${userId}`;
}

export function buildIssueUsers(
  members: any[] = [],
  currentUser?: IssueUser | null,
) {
  const usersById = new Map<number, IssueUser>();

  if (currentUser?.id) {
    usersById.set(currentUser.id, currentUser);
  }

  for (const member of members) {
    const id = Number(member.userId ?? member.id);
    if (!id) continue;

    usersById.set(id, {
      id,
      username: member.username ?? `User ${id}`,
      email: member.email,
    });
  }

  return Array.from(usersById.values());
}

export function isAdminUser(user?: IssueUser | null) {
  return Boolean(
    user?.roles?.some((role) => {
      const name = typeof role === "string" ? role : role.name;
      return ["ADMIN", "SUPERADMIN", "ROLE_ADMIN", "ROLE_SUPERADMIN"].includes(
        name,
      );
    }),
  );
}

export function canEditIssue(issue: Issue, currentUser?: IssueUser | null) {
  if (!currentUser) return false;
  return (
    isAdminUser(currentUser) ||
    issue.createdById === currentUser.id ||
    issue.assigneeId === currentUser.id
  );
}

export function canDeleteIssue(issue: Issue, currentUser?: IssueUser | null) {
  if (!currentUser) return false;
  return isAdminUser(currentUser) || issue.createdById === currentUser.id;
}

export function canComment(issue: Issue, currentUser?: IssueUser | null) {
  return Boolean(issue && currentUser);
}

export function canManageComment(
  commentUserId: number,
  currentUser?: IssueUser | null,
) {
  if (!currentUser) return false;
  return isAdminUser(currentUser) || commentUserId === currentUser.id;
}

export function formatIssueDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatIssueDateTime(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function issueTypeTone(type: IssueType) {
  const tones: Record<IssueType, string> = {
    BUG: "bg-rose-500",
    QUESTION: "bg-cyan-400",
    ENHANCEMENT: "bg-teal-400",
  };
  return tones[type];
}

export function issueSeverityTone(severity: IssueSeverity) {
  const tones: Record<IssueSeverity, string> = {
    OPTIONAL: "bg-slate-300",
    MINOR: "bg-slate-500",
    NORMAL: "bg-lime-400",
    IMPORTANT: "bg-amber-400",
    CRITICAL: "bg-rose-500",
  };
  return tones[severity];
}

export function issuePriorityTone(priority: IssuePriority) {
  const tones: Record<IssuePriority, string> = {
    LOW: "bg-lime-300",
    MEDIUM: "bg-lime-400",
    HIGH: "bg-amber-400",
    CRITICAL: "bg-rose-500",
  };
  return tones[priority];
}
