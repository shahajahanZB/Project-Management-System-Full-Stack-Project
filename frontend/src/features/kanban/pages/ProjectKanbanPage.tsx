import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import {
  Check,
  ChevronDown,
  CircleUserRound,
  Columns3,
  Loader2,
  Filter,
  GripVertical,
  LayoutGrid,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Tag,
  UploadCloud,
  UserRoundCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGetCurrentUser } from "@/features/auth/hooks";
import { useProject, useProjectMembers } from "@/features/projects/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
import {
  useCreateUserStoryStatus,
  useDeleteUserStoryStatus,
  useAddTagToStory,
  useAddUserStoryAttachment,
  useAssignableUsersForProject,
  useAssignUsersToStory,
  useCreateUserStory,
  useRemoveTagFromStory,
  useRemoveUsersFromStory,
  useUpdateUserStory,
  useUpdateUserStoryStatus,
  useUserStoriesByProject,
  useUserStoryStatuses,
} from "../hooks";
import type {
  KanbanAttachment,
  KanbanCard,
  KanbanColumn,
  KanbanDraft,
  KanbanPointKey,
  KanbanPoints,
  KanbanTag,
  KanbanUser,
  UserStory,
} from "../types";

const POINT_KEYS: Array<{ key: KanbanPointKey; label: string }> = [
  { key: "ux", label: "UX" },
  { key: "design", label: "Design" },
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
];

const TAG_COLORS = [
  "bg-cyan-100 text-cyan-800 ring-cyan-200",
  "bg-amber-100 text-amber-800 ring-amber-200",
  "bg-emerald-100 text-emerald-800 ring-emerald-200",
  "bg-rose-100 text-rose-800 ring-rose-200",
  "bg-violet-100 text-violet-800 ring-violet-200",
  "bg-slate-100 text-slate-700 ring-slate-200",
];

const COLUMN_COLORS = [
  "bg-sky-400",
  "bg-amber-400",
  "bg-fuchsia-400",
  "bg-emerald-400",
  "bg-rose-400",
  "bg-indigo-400",
];

const AVATAR_COLORS = [
  "bg-cyan-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
  "bg-slate-700",
];

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "new", title: "New", color: "bg-sky-400", sortOrder: 1 },
  { id: "done", title: "Done", color: "bg-emerald-400", sortOrder: 2 },
];

const DEFAULT_TAGS: KanbanTag[] = [
  {
    id: "frontend",
    label: "Frontend",
    color: "bg-cyan-100 text-cyan-800 ring-cyan-200",
  },
  {
    id: "design",
    label: "Design",
    color: "bg-amber-100 text-amber-800 ring-amber-200",
  },
  {
    id: "api",
    label: "API",
    color: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  },
];

const EMPTY_POINTS: KanbanPoints = {
  ux: 0,
  design: 0,
  frontend: 0,
  backend: 0,
};

type StoredBoard = {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  tags: KanbanTag[];
};

type ModalMode = "create" | "edit";

type ProjectMemberLike = {
  userId?: string | number;
  id?: string | number;
  username?: string;
  name?: string;
  email?: string;
};

type CardModalState = {
  mode: ModalMode;
  cardId?: string;
  draft: KanbanDraft;
};

type StoryAssigneeSync = {
  storyId: number;
  previousAssigneeId: string | null;
  nextAssigneeId: string | null;
};

type StoryTagSync = {
  storyId: number;
  previousTagIds: string[];
  nextTagIds: string[];
};

type DragPayload =
  | {
      type: "card";
      cardId: string;
    }
  | {
      type: "column";
      columnId: string;
    };

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function totalPoints(points: KanbanPoints) {
  return POINT_KEYS.reduce((sum, item) => sum + Number(points[item.key] || 0), 0);
}

function emptyDraft(columnId = DEFAULT_COLUMNS[0].id): KanbanDraft {
  return {
    title: "",
    description: "",
    epicId: null,
    columnId,
    assigneeId: null,
    tagIds: [],
    points: { ...EMPTY_POINTS },
    attachments: [],
  };
}

function seedCards(): KanbanCard[] {
  return [
    {
      id: "KAN-1",
      title: "Create onboarding board",
      description: "Draft the first flow and make the board easy to scan.",
      columnId: "new",
      assigneeId: "demo-me",
      tagIds: ["frontend", "design"],
      points: { ux: 2, design: 3, frontend: 5, backend: 1 },
      attachments: [],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "KAN-2",
      title: "Review release checklist",
      description: "Collect the final QA notes for the project handoff.",
      columnId: "done",
      assigneeId: null,
      tagIds: ["api"],
      points: { ux: 0, design: 1, frontend: 2, backend: 3 },
      attachments: [],
      updatedAt: new Date().toISOString(),
    },
  ];
}

function cardFromStory(
  story: UserStory,
  columns: KanbanColumn[],
): KanbanCard {
  const column =
    columns.find((item) => item.statusId === story.statusId) ?? columns[0];
  const nextTags = story.tags.map((tag, index) => ({
    ...tag,
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
    points: { ...EMPTY_POINTS },
    attachments: story.attachments,
    updatedAt: story.updatedAt ?? new Date().toISOString(),
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function toUser(item: ProjectMemberLike, index: number): KanbanUser {
  const id = String(item?.userId ?? item?.id ?? `member-${index}`);
  const name = String(item?.username ?? item?.name ?? item?.email ?? "Member");
  return {
    id,
    name,
    email: item?.email,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
}

function loadStoredBoard(storageKey: string): StoredBoard | null {
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

function attachmentFromFile(file: File): KanbanAttachment {
  return {
    id: createId("file"),
    name: file.name,
    size: file.size,
    file,
  };
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function normalizeColumnOrder(columns: KanbanColumn[]) {
  return columns.map((column, index) => ({
    ...column,
    sortOrder: index + 1,
  }));
}

function columnFromStatus(
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

function readDragPayload(event: DragEvent<HTMLElement>): DragPayload | null {
  try {
    const raw = event.dataTransfer.getData("application/json");
    if (raw) return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }

  const cardId = event.dataTransfer.getData("text/plain");
  return cardId ? { type: "card", cardId } : null;
}

export function ProjectKanbanPage() {
  useDocumentTitle("Kanban");
  const { projectId } = useParams<{ projectId: string }>();
  const projectQuery = useProject(projectId);
  const membersQuery = useProjectMembers(projectId);
  const currentUserQuery = useGetCurrentUser();
  const statusesQuery = useUserStoryStatuses(projectId);
  const storiesQuery = useUserStoriesByProject(projectId);
  const assignableUsersQuery = useAssignableUsersForProject(projectId);
  const createStatusMutation = useCreateUserStoryStatus(projectId);
  const deleteStatusMutation = useDeleteUserStoryStatus(projectId);
  const createStoryMutation = useCreateUserStory(projectId);
  const updateStoryMutation = useUpdateUserStory(projectId);
  const updateStoryStatusMutation = useUpdateUserStoryStatus(projectId);
  const assignUsersMutation = useAssignUsersToStory(projectId);
  const removeUsersMutation = useRemoveUsersFromStory(projectId);
  const addTagMutation = useAddTagToStory(projectId);
  const removeTagMutation = useRemoveTagFromStory(projectId);
  const addAttachmentMutation = useAddUserStoryAttachment();

  const storageKey = `kanban-board:${projectId ?? "workspace"}`;
  const storedBoard = useMemo(() => loadStoredBoard(storageKey), [storageKey]);

  const [columns, setColumns] = useState<KanbanColumn[]>(
    () => storedBoard?.columns ?? DEFAULT_COLUMNS,
  );
  const [cards, setCards] = useState<KanbanCard[]>(
    () => storedBoard?.cards ?? seedCards(),
  );
  const [tags, setTags] = useState<KanbanTag[]>(
    () => storedBoard?.tags ?? DEFAULT_TAGS,
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modalState, setModalState] = useState<CardModalState | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    if (!statusesQuery.data || statusesQuery.data.length === 0) return;

    const apiColumns = statusesQuery.data
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(columnFromStatus);
    const apiColumnIds = new Set(apiColumns.map((column) => column.id));
    const fallbackColumnId = apiColumns[0]?.id;

    setColumns(apiColumns);
    if (fallbackColumnId) {
      setCards((current) =>
        current.map((card) =>
          apiColumnIds.has(card.columnId)
            ? card
            : { ...card, columnId: fallbackColumnId },
        ),
      );
    }
  }, [statusesQuery.data]);

  useEffect(() => {
    if (!storiesQuery.data) return;

    const nextTags = new Map(tags.map((tag) => [tag.id, tag]));
    let changed = false;
    storiesQuery.data.forEach((story) => {
      story.tags.forEach((tag, index) => {
        if (!nextTags.has(tag.id)) {
          nextTags.set(tag.id, {
            ...tag,
            color: TAG_COLORS[(nextTags.size + index) % TAG_COLORS.length],
          });
          changed = true;
        }
      });
    });
    const nextTagList = Array.from(nextTags.values());
    if (changed) setTags(nextTagList);
    setCards(
      storiesQuery.data.map((story) => cardFromStory(story, columns)),
    );
  }, [columns, storiesQuery.data, tags]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ columns, cards, tags }),
    );
  }, [cards, columns, storageKey, tags]);

  useEffect(() => {
    if (!lastAction) return;
    const timeout = window.setTimeout(() => setLastAction(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [lastAction]);

  const users = useMemo(() => {
    const mapped =
      assignableUsersQuery.data && assignableUsersQuery.data.length > 0
        ? assignableUsersQuery.data
        : (membersQuery.data ?? []).map(toUser);
    const currentUser = currentUserQuery.data;
    const currentAsUser = currentUser
      ? ({
          id: String(currentUser.id),
          name: currentUser.username ?? currentUser.email ?? "Me",
          email: currentUser.email,
          avatarColor: "bg-indigo-600",
        } satisfies KanbanUser)
      : null;

    const withCurrent =
      currentAsUser && !mapped.some((user) => user.id === currentAsUser.id)
        ? [currentAsUser, ...mapped]
        : mapped;

    return withCurrent.length > 0
      ? withCurrent
      : [
          {
            id: "demo-me",
            name: "You",
            email: "you@example.com",
            avatarColor: "bg-indigo-600",
          },
          {
            id: "demo-designer",
            name: "Maya Design",
            email: "maya@example.com",
            avatarColor: "bg-amber-600",
          },
          {
            id: "demo-dev",
            name: "Dev Team",
            email: "dev@example.com",
            avatarColor: "bg-emerald-600",
          },
        ];
  }, [assignableUsersQuery.data, currentUserQuery.data, membersQuery.data]);

  const currentUserId = currentUserQuery.data?.id
    ? String(currentUserQuery.data.id)
    : "demo-me";

  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );
  const tagById = useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag])),
    [tags],
  );

  const filteredCards = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cards.filter((card) => {
      const assignee = card.assigneeId ? userById.get(card.assigneeId) : null;
      const cardTags = card.tagIds
        .map((id) => tagById.get(id)?.label ?? "")
        .join(" ");
      const haystack = [
        card.id,
        card.title,
        card.description,
        assignee?.name,
        cardTags,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !needle || haystack.includes(needle);
      const matchesStatus =
        statusFilter === "all" || card.columnId === statusFilter;
      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "me" && card.assigneeId === currentUserId) ||
        (assigneeFilter === "unassigned" && !card.assigneeId) ||
        card.assigneeId === assigneeFilter;
      const matchesTag = tagFilter === "all" || card.tagIds.includes(tagFilter);

      return (
        matchesQuery && matchesStatus && matchesAssignee && matchesTag
      );
    });
  }, [
    assigneeFilter,
    cards,
    currentUserId,
    query,
    statusFilter,
    tagById,
    tagFilter,
    userById,
  ]);

  const cardsByColumn = useMemo(() => {
    return columns.reduce<Record<string, KanbanCard[]>>((acc, column) => {
      acc[column.id] = filteredCards.filter(
        (card) => card.columnId === column.id,
      );
      return acc;
    }, {});
  }, [columns, filteredCards]);

  const boardTotals = useMemo(() => {
    return {
      cards: cards.length,
      points: cards.reduce((sum, card) => sum + totalPoints(card.points), 0),
      assigned: cards.filter((card) => card.assigneeId).length,
    };
  }, [cards]);

  function openCreateModal(columnId = columns[0]?.id ?? "new") {
    setTagInput("");
    setModalState({
      mode: "create",
      draft: emptyDraft(columnId),
    });
  }

  function openEditModal(card: KanbanCard) {
    setTagInput("");
    setModalState({
      mode: "edit",
      cardId: card.id,
      draft: {
        title: card.title,
        description: card.description,
        columnId: card.columnId,
        assigneeId: card.assigneeId,
        tagIds: card.tagIds,
        points: { ...card.points },
        attachments: card.attachments,
      },
    });
  }

  function updateDraft(partial: Partial<KanbanDraft>) {
    setModalState((current) =>
      current
        ? {
            ...current,
            draft: { ...current.draft, ...partial },
          }
        : current,
    );
  }

  function updateDraftPoints(key: KanbanPointKey, value: string) {
    const nextValue = Math.max(0, Number(value) || 0);
    setModalState((current) =>
      current
        ? {
            ...current,
            draft: {
              ...current.draft,
              points: {
                ...current.draft.points,
                [key]: nextValue,
              },
            },
          }
        : current,
    );
  }

  function addTagToDraft(tagId: string) {
    setModalState((current) => {
      if (!current || current.draft.tagIds.includes(tagId)) return current;
      return {
        ...current,
        draft: {
          ...current.draft,
          tagIds: [...current.draft.tagIds, tagId],
        },
      };
    });
  }

  function removeTagFromDraft(tagId: string) {
    setModalState((current) =>
      current
        ? {
            ...current,
            draft: {
              ...current.draft,
              tagIds: current.draft.tagIds.filter((id) => id !== tagId),
            },
          }
        : current,
    );
  }

  function handleCreateTag() {
    const label = tagInput.trim();
    if (!label) return;
    const existing = tags.find(
      (tag) => tag.label.toLowerCase() === label.toLowerCase(),
    );
    if (existing) {
      addTagToDraft(existing.id);
      setTagInput("");
      return;
    }

    const tag: KanbanTag = {
      id: slugify(label) || createId("tag"),
      label,
      color: TAG_COLORS[tags.length % TAG_COLORS.length],
    };
    setTags((current) => [...current, tag]);
    addTagToDraft(tag.id);
    setTagInput("");
  }

  function handleFiles(files: FileList | File[]) {
    const attachments = Array.from(files).map(attachmentFromFile);
    setModalState((current) =>
      current
        ? {
            ...current,
            draft: {
              ...current.draft,
              attachments: [...current.draft.attachments, ...attachments],
            },
          }
        : current,
    );
  }

  function removeAttachment(attachmentId: string) {
    setModalState((current) =>
      current
        ? {
            ...current,
            draft: {
              ...current.draft,
              attachments: current.draft.attachments.filter(
                (attachment) => attachment.id !== attachmentId,
              ),
            },
          }
        : current,
    );
  }

  function userIdPayload(userId: string | null) {
    if (!userId) return [];
    const numberValue = Number(userId);
    return Number.isFinite(numberValue) ? [numberValue] : [];
  }

  async function syncStoryAssignee({
    storyId,
    previousAssigneeId,
    nextAssigneeId,
  }: StoryAssigneeSync) {
    const previousUserIds = userIdPayload(previousAssigneeId);
    const nextUserIds = userIdPayload(nextAssigneeId);

    if (previousAssigneeId && previousAssigneeId !== nextAssigneeId) {
      await removeUsersMutation.mutateAsync({
        storyId,
        payload: { userIds: previousUserIds },
      });
    }

    if (nextAssigneeId && previousAssigneeId !== nextAssigneeId) {
      await assignUsersMutation.mutateAsync({
        storyId,
        payload: { userIds: nextUserIds },
      });
    }
  }

  async function syncStoryTags({
    storyId,
    previousTagIds,
    nextTagIds,
  }: StoryTagSync) {
    const addedTagIds = nextTagIds.filter((tagId) => !previousTagIds.includes(tagId));
    const removedTagIds = previousTagIds.filter((tagId) => !nextTagIds.includes(tagId));

    for (const tagId of addedTagIds) {
      const tag = tags.find((item) => item.id === tagId);
      if (tag) {
        await addTagMutation.mutateAsync({
          storyId,
          payload: { name: tag.label },
        });
      }
    }

    for (const tagId of removedTagIds) {
      const tag = tags.find((item) => item.id === tagId);
      if (tag) {
        await removeTagMutation.mutateAsync({
          storyId,
          payload: { name: tag.label },
        });
      }
    }
  }

  async function uploadPendingAttachments(storyId: number, draft: KanbanDraft) {
    const pendingAttachments = draft.attachments.filter(
      (attachment) => attachment.file,
    );

    for (const attachment of pendingAttachments) {
      if (attachment.file) {
        await addAttachmentMutation.mutateAsync({
          storyId,
          file: attachment.file,
          metadata: { description: attachment.name },
        });
      }
    }
  }

  async function handleModalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modalState || !modalState.draft.title.trim()) return;
    const projectNumber = Number(projectId);
    const statusId =
      columns.find((column) => column.id === modalState.draft.columnId)
        ?.statusId ?? null;

    if (modalState.mode === "edit" && modalState.cardId) {
      const previousCard = cards.find((card) => card.id === modalState.cardId);
      if (previousCard?.storyId) {
        try {
          await updateStoryMutation.mutateAsync({
            storyId: previousCard.storyId,
            payload: {
              title: modalState.draft.title.trim(),
              description: modalState.draft.description,
              epicId: modalState.draft.epicId ?? null,
            },
          });
          if (statusId && statusId !== previousCard.statusId) {
            await updateStoryStatusMutation.mutateAsync({
              storyId: previousCard.storyId,
              payload: { statusId },
            });
          }
          await syncStoryAssignee({
            storyId: previousCard.storyId,
            previousAssigneeId: previousCard.assigneeId,
            nextAssigneeId: modalState.draft.assigneeId,
          });
          await syncStoryTags({
            storyId: previousCard.storyId,
            previousTagIds: previousCard.tagIds,
            nextTagIds: modalState.draft.tagIds,
          });
          await uploadPendingAttachments(previousCard.storyId, modalState.draft);
        } catch (error) {
          setLastAction((error as Error)?.message || "Could not update story");
          return;
        }
      }

      setCards((current) =>
        current.map((card) =>
          card.id === modalState.cardId
            ? {
                ...card,
                ...modalState.draft,
                title: modalState.draft.title.trim(),
                updatedAt: new Date().toISOString(),
              }
            : card,
        ),
      );
      setLastAction(`Updated ${modalState.cardId}`);
    } else {
      let createdStoryId: number | undefined;
      if (Number.isFinite(projectNumber) && projectNumber > 0) {
        try {
          const created = await createStoryMutation.mutateAsync({
            projectId: projectNumber,
            epicId: modalState.draft.epicId ?? null,
            statusId,
            title: modalState.draft.title.trim(),
            description: modalState.draft.description,
          });
          createdStoryId = created.id;
          await syncStoryAssignee({
            storyId: created.id,
            previousAssigneeId: null,
            nextAssigneeId: modalState.draft.assigneeId,
          });
          await syncStoryTags({
            storyId: created.id,
            previousTagIds: [],
            nextTagIds: modalState.draft.tagIds,
          });
          await uploadPendingAttachments(created.id, modalState.draft);
        } catch (error) {
          setLastAction((error as Error)?.message || "Could not create story");
          return;
        }
      }

      const cardNumber = cards.length + 1;
      const card: KanbanCard = {
        id: createdStoryId ? `US-${createdStoryId}` : `KAN-${cardNumber}`,
        storyId: createdStoryId,
        statusId,
        ...modalState.draft,
        title: modalState.draft.title.trim(),
        updatedAt: new Date().toISOString(),
      };
      setCards((current) => [card, ...current]);
      setLastAction(`Created ${card.id}`);
    }

    setModalState(null);
  }

  function handleDragStart(
    event: DragEvent<HTMLButtonElement>,
    cardId: string,
  ) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", cardId);
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "card", cardId } satisfies DragPayload),
    );
    setDraggingCardId(cardId);
  }

  function handleColumnDragStart(
    event: DragEvent<HTMLDivElement>,
    columnId: string,
  ) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "column", columnId } satisfies DragPayload),
    );
    setDraggingColumnId(columnId);
  }

  async function moveCardToColumn(
    cardId: string,
    columnId: string,
    beforeCardId?: string,
  ) {
    const targetColumn = columns.find((column) => column.id === columnId);
    const previousCard = cards.find((card) => card.id === cardId);
    const previousCards = cards;

    setCards((current) => {
      const movingCard = current.find((card) => card.id === cardId);
      if (!movingCard) return current;

      const withoutMoving = current.filter((card) => card.id !== cardId);
      const updatedCard = {
        ...movingCard,
        columnId,
        updatedAt: new Date().toISOString(),
      };
      const beforeIndex = beforeCardId
        ? withoutMoving.findIndex((card) => card.id === beforeCardId)
        : -1;

      if (beforeIndex >= 0) {
        return [
          ...withoutMoving.slice(0, beforeIndex),
          updatedCard,
          ...withoutMoving.slice(beforeIndex),
        ];
      }

      return [...withoutMoving, updatedCard];
    });

    if (
      previousCard?.storyId &&
      targetColumn?.statusId &&
      previousCard.statusId !== targetColumn.statusId
    ) {
      try {
        await updateStoryStatusMutation.mutateAsync({
          storyId: previousCard.storyId,
          payload: { statusId: targetColumn.statusId },
        });
      } catch (error) {
        setCards(previousCards);
        setLastAction((error as Error)?.message || "Could not update status");
        return;
      }
    }

    if (previousCard?.columnId !== columnId && targetColumn) {
      setLastAction(`Moved ${cardId} to ${targetColumn.title}`);
    } else {
      setLastAction(`Reordered ${cardId}`);
    }
  }

  function handleColumnDrop(event: DragEvent<HTMLDivElement>, columnId: string) {
    event.preventDefault();
    const payload = readDragPayload(event);
    if (!payload) return;

    if (payload.type === "column") {
      reorderColumns(payload.columnId, columnId);
    } else {
      void moveCardToColumn(payload.cardId, columnId);
    }

    setDraggingCardId(null);
    setDraggingColumnId(null);
    setActiveColumnId(null);
  }

  function handleCardDrop(
    event: DragEvent<HTMLButtonElement>,
    targetCard: KanbanCard,
  ) {
    event.preventDefault();
    event.stopPropagation();
    const payload = readDragPayload(event);
    if (!payload || payload.type !== "card" || payload.cardId === targetCard.id) {
      return;
    }
    void moveCardToColumn(payload.cardId, targetCard.columnId, targetCard.id);
    setDraggingCardId(null);
    setActiveColumnId(null);
  }

  function reorderColumns(sourceColumnId: string, targetColumnId: string) {
    if (sourceColumnId === targetColumnId) return;

    setColumns((current) => {
      const fromIndex = current.findIndex((column) => column.id === sourceColumnId);
      const toIndex = current.findIndex((column) => column.id === targetColumnId);
      if (fromIndex < 0 || toIndex < 0) return current;
      return normalizeColumnOrder(moveItem(current, fromIndex, toIndex));
    });
    setLastAction("Columns reordered locally");
  }

  async function handleAddColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = columnName.trim();
    if (!title) return;

    const projectNumber = Number(projectId);
    const nextSortOrder = columns.length + 1;

    if (Number.isFinite(projectNumber) && projectNumber > 0) {
      try {
        const created = await createStatusMutation.mutateAsync({
          projectId: projectNumber,
          name: title,
          sortOrder: nextSortOrder,
        });
        const column = columnFromStatus(created, columns.length);
        setColumns((current) => normalizeColumnOrder([...current, column]));
        setLastAction(`Created ${title}`);
      } catch (error) {
        setLastAction(
          (error as Error)?.message || "Could not create status",
        );
        return;
      }
    } else {
      const column: KanbanColumn = {
        id: slugify(title) || createId("column"),
        title,
        sortOrder: nextSortOrder,
        color: COLUMN_COLORS[columns.length % COLUMN_COLORS.length],
      };
      setColumns((current) => normalizeColumnOrder([...current, column]));
      setLastAction(`Added ${title}`);
    }

    setColumnName("");
    setIsAddingColumn(false);
  }

  async function handleDeleteColumn(column: KanbanColumn) {
    if (cards.some((card) => card.columnId === column.id)) {
      setLastAction("Move cards out before deleting this column");
      return;
    }

    if (column.statusId) {
      try {
        await deleteStatusMutation.mutateAsync(column.statusId);
      } catch (error) {
        setLastAction(
          (error as Error)?.message || "Could not delete status",
        );
        return;
      }
    }

    setColumns((current) =>
      normalizeColumnOrder(current.filter((item) => item.id !== column.id)),
    );
    if (statusFilter === column.id) setStatusFilter("all");
    setLastAction(`Deleted ${column.title}`);
  }

  function handleAttachmentInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <section className="-mx-4 -my-6 min-h-screen bg-slate-100 text-slate-900 lg:-mx-8">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <LayoutGrid className="size-4 text-teal-600" />
              <span>{projectQuery.data?.name ?? "Project"}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-end gap-3">
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                Kanban
              </h1>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                <span className="rounded bg-white px-2 py-1 ring-1 ring-slate-200">
                  {boardTotals.cards} cards
                </span>
                <span className="rounded bg-white px-2 py-1 ring-1 ring-slate-200">
                  {boardTotals.points} points
                </span>
                <span className="rounded bg-white px-2 py-1 ring-1 ring-slate-200">
                  {boardTotals.assigned} assigned
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
            <label className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search cards"
                className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setFiltersOpen((value) => !value)}
                className="border-slate-300"
              >
                <Filter className="size-4" />
                Filters
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsAddingColumn((value) => !value)}
                className="border-slate-300"
              >
                <Columns3 className="size-4" />
                Add column
              </Button>
              <Button
                onClick={() => openCreateModal()}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                <Plus className="size-4" />
                Story
              </Button>
            </div>
          </div>
        </div>

        {(filtersOpen || statusesQuery.isLoading) && (
          <div className="mt-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            {statusesQuery.isLoading && (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Loading statuses...
              </div>
            )}
            {statusesQuery.isError && (
              <p className="text-sm font-medium text-rose-600">
                Could not load backend statuses. Showing local board data.
              </p>
            )}
            {filtersOpen && (
              <div className="grid gap-3 md:grid-cols-3">
                <SelectField
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "All status" },
                    ...columns.map((column) => ({
                      value: column.id,
                      label: column.title,
                    })),
                  ]}
                />
                <SelectField
                  label="Assignee"
                  value={assigneeFilter}
                  onChange={setAssigneeFilter}
                  options={[
                    { value: "all", label: "All assignees" },
                    { value: "me", label: "Assigned to me" },
                    { value: "unassigned", label: "Unassigned" },
                    ...users.map((user) => ({
                      value: user.id,
                      label: user.name,
                    })),
                  ]}
                />
                <SelectField
                  label="Tag"
                  value={tagFilter}
                  onChange={setTagFilter}
                  options={[
                    { value: "all", label: "All tags" },
                    ...tags.map((tag) => ({ value: tag.id, label: tag.label })),
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </header>

      <div className="overflow-x-auto px-4 py-5 lg:px-8">
        <div
          className="grid min-h-[calc(100vh-15rem)] auto-cols-[minmax(18rem,22rem)] grid-flow-col gap-4 pb-4"
          aria-label="Kanban board"
        >
          {columns.map((column) => {
            const columnCards = cardsByColumn[column.id] ?? [];
            return (
              <div
                key={column.id}
                draggable
                onDragStart={(event) => handleColumnDragStart(event, column.id)}
                onDragEnd={() => {
                  setDraggingColumnId(null);
                  setActiveColumnId(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setActiveColumnId(column.id);
                }}
                onDragLeave={() => setActiveColumnId(null)}
                onDrop={(event) => handleColumnDrop(event, column.id)}
                className={cn(
                  "flex max-h-[calc(100vh-13rem)] min-h-[28rem] flex-col rounded-md border border-slate-200 bg-slate-200/80 transition duration-200",
                  activeColumnId === column.id &&
                    "border-teal-400 bg-teal-50/80 shadow-soft",
                  draggingColumnId === column.id && "opacity-60",
                )}
              >
                <div className="flex h-12 items-center justify-between gap-2 border-b border-slate-300/70 px-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <GripVertical className="size-4 shrink-0 text-slate-400" />
                    <span className={cn("h-4 w-1.5 rounded", column.color)} />
                    <h2 className="truncate text-sm font-bold uppercase text-slate-800">
                      {column.title}
                    </h2>
                    <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                      {columnCards.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openCreateModal(column.id)}
                      className="inline-flex size-8 items-center justify-center rounded text-slate-500 transition hover:bg-white hover:text-teal-700"
                      title={`Add story to ${column.title}`}
                    >
                      <Plus className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteColumn(column)}
                      disabled={
                        columnCards.length > 0 || deleteStatusMutation.isPending
                      }
                      className="inline-flex size-8 items-center justify-center rounded text-slate-500 transition hover:bg-white hover:text-rose-700 disabled:pointer-events-none disabled:opacity-40"
                      title={
                        columnCards.length > 0
                          ? "Move cards before deleting"
                          : `Delete ${column.title}`
                      }
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-3">
                  {columnCards.map((card) => (
                    <KanbanStoryCard
                      key={card.id}
                      card={card}
                      tags={tagById}
                      user={card.assigneeId ? userById.get(card.assigneeId) : null}
                      dragging={draggingCardId === card.id}
                      onDragStart={handleDragStart}
                      onDrop={handleCardDrop}
                      onDragEnd={() => {
                        setDraggingCardId(null);
                        setActiveColumnId(null);
                      }}
                      onEdit={() => openEditModal(card)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {isAddingColumn ? (
            <form
              onSubmit={handleAddColumn}
              className="flex h-12 items-center gap-2 rounded-md border border-teal-300 bg-white p-2 shadow-soft"
            >
              <input
                value={columnName}
                onChange={(event) => setColumnName(event.target.value)}
                autoFocus
                placeholder="New column name"
                className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="submit"
                disabled={createStatusMutation.isPending}
                className="inline-flex size-8 items-center justify-center rounded bg-teal-600 text-white transition hover:bg-teal-700 disabled:opacity-50"
                title="Create column"
              >
                {createStatusMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingColumn(false);
                  setColumnName("");
                }}
                className="inline-flex size-8 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                title="Cancel"
              >
                <X className="size-4" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingColumn(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-teal-400 hover:text-teal-700"
            >
              <Plus className="size-4" />
              Add column
            </button>
          )}
        </div>
      </div>

      {lastAction && (
        <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {lastAction}
        </div>
      )}

      {modalState && (
        <CardModal
          state={modalState}
          columns={columns}
          users={users}
          tags={tags}
          currentUserId={currentUserId}
          tagInput={tagInput}
          onTagInputChange={setTagInput}
          onClose={() => setModalState(null)}
          onSubmit={handleModalSubmit}
          onDraftChange={updateDraft}
          onPointChange={updateDraftPoints}
          onCreateTag={handleCreateTag}
          onAddTag={addTagToDraft}
          onRemoveTag={removeTagFromDraft}
          onFiles={handleFiles}
          onAttachmentInput={handleAttachmentInput}
          onRemoveAttachment={removeAttachment}
        />
      )}
    </section>
  );
}

function KanbanStoryCard({
  card,
  tags,
  user,
  dragging,
  onDragStart,
  onDragEnd,
  onDrop,
  onEdit,
}: {
  card: KanbanCard;
  tags: Map<string, KanbanTag>;
  user: KanbanUser | null | undefined;
  dragging: boolean;
  onDragStart: (event: DragEvent<HTMLButtonElement>, cardId: string) => void;
  onDragEnd: () => void;
  onDrop: (event: DragEvent<HTMLButtonElement>, targetCard: KanbanCard) => void;
  onEdit: () => void;
}) {
  const cardTags = card.tagIds
    .map((tagId) => tags.get(tagId))
    .filter(Boolean) as KanbanTag[];

  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => onDragStart(event, card.id)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDrop(event, card)}
      onClick={onEdit}
      className={cn(
        "group w-full rounded-md border border-slate-200 bg-white p-4 text-left shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg",
        dragging && "scale-[0.98] opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-teal-700">{card.id}</span>
            {card.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <Paperclip className="size-3.5" />
                {card.attachments.length}
              </span>
            )}
          </div>
          <h3 className="mt-1 text-sm font-semibold leading-5 text-slate-900">
            {card.title}
          </h3>
        </div>
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded text-slate-400 transition group-hover:bg-slate-100 group-hover:text-slate-700">
          <MoreHorizontal className="size-4" />
        </span>
      </div>

      {cardTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {cardTags.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-semibold ring-1",
                tag.color,
              )}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        {user ? (
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                user.avatarColor,
              )}
            >
              {initials(user.name)}
            </span>
            <span className="truncate text-xs font-medium text-slate-600">
              {user.name}
            </span>
          </div>
        ) : (
          <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500">
            <CircleUserRound className="size-5 text-slate-400" />
            Unassigned
          </span>
        )}
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
          {totalPoints(card.points)} pts
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1 text-slate-300">
        <GripVertical className="size-4" />
        <span className="text-[11px] font-medium text-slate-400">Drag</span>
      </div>
    </button>
  );
}

function CardModal({
  state,
  columns,
  users,
  tags,
  currentUserId,
  tagInput,
  onTagInputChange,
  onClose,
  onSubmit,
  onDraftChange,
  onPointChange,
  onCreateTag,
  onAddTag,
  onRemoveTag,
  onFiles,
  onAttachmentInput,
  onRemoveAttachment,
}: {
  state: CardModalState;
  columns: KanbanColumn[];
  users: KanbanUser[];
  tags: KanbanTag[];
  currentUserId: string;
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftChange: (partial: Partial<KanbanDraft>) => void;
  onPointChange: (key: KanbanPointKey, value: string) => void;
  onCreateTag: () => void;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onFiles: (files: FileList | File[]) => void;
  onAttachmentInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}) {
  const draft = state.draft;
  const selectedTags = draft.tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter(Boolean) as KanbanTag[];
  const availableTags = tags.filter((tag) => !draft.tagIds.includes(tag.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="mx-auto my-6 grid w-full max-w-5xl gap-6 rounded-md bg-white p-5 shadow-2xl md:grid-cols-[minmax(0,1fr)_20rem] md:p-7"
      >
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-950">
              {state.mode === "create" ? "New user story" : "Edit user story"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
              title="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">
              Title
            </span>
            <input
              value={draft.title}
              onChange={(event) =>
                onDraftChange({ title: event.target.value })
              }
              autoFocus
              required
              placeholder="Story title"
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-medium outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onRemoveTag(tag.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ring-1",
                    tag.color,
                  )}
                >
                  {tag.label}
                  <X className="size-3" />
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={tagInput}
                  onChange={(event) => onTagInputChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onCreateTag();
                    }
                  }}
                  placeholder="Add tag"
                  className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={onCreateTag}
                className="border-slate-300"
              >
                <Plus className="size-4" />
                Tag
              </Button>
            </div>
            {availableTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onAddTag(tag.id)}
                    className={cn(
                      "rounded px-2 py-0.5 text-[11px] font-semibold ring-1 transition hover:scale-[1.02]",
                      tag.color,
                    )}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">
              Description
            </span>
            <textarea
              value={draft.description}
              onChange={(event) =>
                onDraftChange({ description: event.target.value })
              }
              placeholder="Description"
              rows={9}
              className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <div className="rounded-md border border-slate-200">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-100 px-3 py-2">
              <span className="text-sm font-bold text-slate-700">
                {draft.attachments.length} Attachments
              </span>
              <label className="inline-flex size-9 cursor-pointer items-center justify-center rounded bg-teal-100 text-teal-800 transition hover:bg-teal-200">
                <Plus className="size-4" />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onAttachmentInput}
                />
              </label>
            </div>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onFiles(event.dataTransfer.files);
              }}
              className="m-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-center"
            >
              <UploadCloud className="mx-auto size-6 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Drop attachments here
              </p>
            </div>
            {draft.attachments.length > 0 && (
              <div className="space-y-2 border-t border-slate-200 p-3">
                {draft.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-3 rounded bg-white px-3 py-2 ring-1 ring-slate-200"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(attachment.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(attachment.id)}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                      title="Remove attachment"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <button
            type="button"
            onClick={onClose}
            className="ml-auto hidden size-9 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:flex"
            title="Close"
          >
            <X className="size-5" />
          </button>

          <SelectField
            label="Status"
            value={draft.columnId}
            onChange={(value) => onDraftChange({ columnId: value })}
            options={columns.map((column) => ({
              value: column.id,
              label: column.title,
            }))}
          />

          <div className="rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar user={users.find((user) => user.id === draft.assigneeId)} />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Assignee
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {users.find((user) => user.id === draft.assigneeId)?.name ??
                      "Unassigned"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onDraftChange({ assigneeId: currentUserId })}
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                <UserRoundCheck className="size-4" />
                Me
              </Button>
            </div>

            <label className="mt-3 block">
              <span className="text-xs font-bold uppercase text-slate-500">
                Assign
              </span>
              <div className="relative mt-1">
                <select
                  value={draft.assigneeId ?? "unassigned"}
                  onChange={(event) =>
                    onDraftChange({
                      assigneeId:
                        event.target.value === "unassigned"
                          ? null
                          : event.target.value,
                    })
                  }
                  className="h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 pr-9 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="unassigned">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Points</p>
            <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
              {POINT_KEYS.map((item) => (
                <label
                  key={item.key}
                  className="grid grid-cols-[1fr_5rem] items-center border-b border-slate-200 last:border-b-0"
                >
                  <span className="bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                    {item.label}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={draft.points[item.key]}
                    onChange={(event) =>
                      onPointChange(item.key, event.target.value)
                    }
                    className="h-10 border-l border-slate-200 px-3 text-right text-sm font-semibold outline-none focus:bg-teal-50"
                  />
                </label>
              ))}
              <div className="grid grid-cols-[1fr_5rem] items-center bg-slate-200">
                <span className="px-3 py-2 text-sm font-bold text-slate-700">
                  Total
                </span>
                <span className="border-l border-slate-300 px-3 py-2 text-right text-sm font-bold text-slate-900">
                  {totalPoints(draft.points)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetricButton label="Activity" value="Today" />
            <MetricButton label="Team" value={String(users.length)} />
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-teal-500 text-slate-950 hover:bg-teal-400"
          >
            {state.mode === "create" ? "Create" : "Save changes"}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-bold uppercase text-slate-500">
        {label}
      </span>
      <div className="relative mt-1">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 pr-9 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function Avatar({ user }: { user?: KanbanUser | null }) {
  if (!user) {
    return (
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
        <CircleUserRound className="size-5" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
        user.avatarColor,
      )}
    >
      {initials(user.name)}
    </span>
  );
}

function MetricButton({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-100 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
