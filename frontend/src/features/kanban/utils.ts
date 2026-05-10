import type { DragEvent } from "react";
import {
  AVATAR_COLORS,
  COLUMN_COLORS,
  DEFAULT_COLUMNS,
  DEFAULT_TAGS,
  EMPTY_POINTS,
  POINT_KEYS,
  TAG_COLORS,
} from "./constants";
import type {
  DragPayload,
  KanbanAttachment,
  KanbanCard,
  KanbanColumn,
  KanbanDraft,
  KanbanPoints,
  KanbanUser,
  ProjectMemberLike,
  StoredBoard,
  UserStory,
} from "./types";

export function createId(prefix: string) {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function totalPoints(points: KanbanPoints) {
  return POINT_KEYS.reduce(
    (sum, item) => sum + Number(points[item.key] || 0),
    0,
  );
}

export function emptyDraft(columnId = DEFAULT_COLUMNS[0].id): KanbanDraft {
  return {
    title: "",
    description: "",
    epicId: null,
    columnId,
    assigneeId: null,
    tagIds: [],
    endDate: null,
    attachments: [],
  };
}

export function seedCards(): KanbanCard[] {
  return [
    {
      id: "KAN-1",
      title: "Create onboarding board",
      description: "Draft the first flow and make the board easy to scan.",
      columnId: "new",
      assigneeId: "demo-me",
      tagIds: ["frontend", "design"],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: [],
      attachmentCount: 0,
      commentCount: 0,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "KAN-2",
      title: "Review release checklist",
      description: "Collect the final QA notes for the project handoff.",
      columnId: "done",
      assigneeId: null,
      tagIds: ["api"],
      endDate: null,
      attachments: [],
      attachmentCount: 0,
      commentCount: 0,
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function cardFromStory(
  story: UserStory,
  columns: KanbanColumn[],
): KanbanCard {
  const column =
    columns.find((item) => item.statusId === story.statusId) ?? columns[0];
  const nextTags = story.tags.map((tag, index) => ({
    ...tag,
    id: slugify(tag.id) || tag.id,
    color: tag.color || TAG_COLORS[index % TAG_COLORS.length],
  }));

  return {
    id: `US-${story.id}`,
    storyId: story.id,
    epicId: story.epicId,
    statusId: story.statusId,
    title: story.title,
    description: story.description,
    columnId: column?.id ?? DEFAULT_COLUMNS[0].id,
    assigneeId: story.assignees[0]?.id ?? null,
    tagIds: nextTags.map((tag) => tag.id),
    endDate: story.endDate ?? null,
    attachments: story.attachments,
    attachmentCount: story.attachmentCount ?? story.attachments.length,
    commentCount: story.commentCount ?? 0,
    updatedAt: story.updatedAt ?? new Date().toISOString(),
  };
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function toUser(item: ProjectMemberLike, index: number): KanbanUser {
  const id = String(item?.userId ?? item?.id ?? `member-${index}`);
  const name = String(item?.username ?? item?.name ?? item?.email ?? "Member");

  return {
    id,
    name,
    email: item?.email,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
}

export function loadStoredBoard(storageKey: string): StoredBoard | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredBoard;
    if (!Array.isArray(parsed.columns) || !Array.isArray(parsed.cards)) {
      return null;
    }

    return {
      columns: parsed.columns,
      cards: parsed.cards,
      tags: Array.isArray(parsed.tags) ? parsed.tags : DEFAULT_TAGS,
    };
  } catch {
    return null;
  }
}

export function attachmentFromFile(file: File): KanbanAttachment {
  return {
    id: createId("file"),
    name: file.name,
    size: file.size,
    file,
  };
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function normalizeColumnOrder(columns: KanbanColumn[]) {
  return columns.map((column, index) => ({
    ...column,
    sortOrder: index + 1,
  }));
}

export function columnFromStatus(
  status: { id: number; name: string; sortOrder: number },
  index: number,
): KanbanColumn {
  return {
    id: `status-${status.id}`,
    statusId: status.id,
    title: status.name,
    sortOrder: status.sortOrder || index + 1,
    color: COLUMN_COLORS[index % COLUMN_COLORS.length],
  };
}

export function readDragPayload(
  event: DragEvent<HTMLElement>,
): DragPayload | null {
  try {
    const raw = event.dataTransfer.getData("application/json");
    if (raw) return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }

  const cardId = event.dataTransfer.getData("text/plain");
  return cardId ? { type: "card", cardId } : null;
}
