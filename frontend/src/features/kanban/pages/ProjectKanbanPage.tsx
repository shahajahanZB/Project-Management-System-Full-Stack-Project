import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { useParams } from "react-router-dom";
import { useGetCurrentUser, useHasPermission } from "@/features/auth/hooks";
import { useProject, useProjectMembers } from "@/features/projects/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  COLUMN_COLORS,
  DEFAULT_COLUMNS,
  DEFAULT_TAGS,
  TAG_COLORS,
} from "../constants";
import {
  useAddTagToStory,
  useAddUserStoryAttachment,
  useAssignableUsersForProject,
  useAssignUsersToStory,
  useCreateUserStory,
  useCreateUserStoryStatus,
  useDeleteUserStoryAttachment,
  useDeleteUserStoryStatus,
  useRemoveTagFromStory,
  useRemoveUsersFromStory,
  useUpdateUserStory,
  useUpdateUserStoryStatus,
  useUpdateUserStoryTiming,
  useUserStoriesByProject,
  useUserStoryStatuses,
} from "../hooks";
import type {
  CardModalState,
  KanbanAttachment,
  KanbanCard,
  KanbanColumn,
  KanbanDraft,
  KanbanTag,
  KanbanUser,
  StoryAssigneeSync,
  StoryTagSync,
} from "../types";
import {
  attachmentFromFile,
  cardFromStory,
  columnFromStatus,
  createId,
  emptyDraft,
  loadStoredBoard,
  moveItem,
  normalizeColumnOrder,
  readDragPayload,
  seedCards,
  slugify,
  toUser,
} from "../utils";
import {
  AddColumnForm,
  CardModal,
  KanbanBoardColumn,
  KanbanBoardHeader,
} from "../components";

export function ProjectKanbanPage() {
  useDocumentTitle("Kanban");

  const { projectId } = useParams<{ projectId: string }>();
  const projectQuery = useProject(projectId);
  const membersQuery = useProjectMembers(projectId);
  const currentUserQuery = useGetCurrentUser();
  const statusesQuery = useUserStoryStatuses(projectId);
  const assignableUsersQuery = useAssignableUsersForProject(projectId);
  const createStatusMutation = useCreateUserStoryStatus(projectId);
  const deleteStatusMutation = useDeleteUserStoryStatus(projectId);
  const createStoryMutation = useCreateUserStory(projectId);
  const updateStoryMutation = useUpdateUserStory(projectId);
  const updateStoryStatusMutation = useUpdateUserStoryStatus(projectId);
  const updateStoryTimingMutation = useUpdateUserStoryTiming();
  const assignUsersMutation = useAssignUsersToStory(projectId);
  const removeUsersMutation = useRemoveUsersFromStory(projectId);
  const addTagMutation = useAddTagToStory(projectId);
  const removeTagMutation = useRemoveTagFromStory(projectId);
  const addAttachmentMutation = useAddUserStoryAttachment();
  const deleteAttachmentMutation = useDeleteUserStoryAttachment();

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
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<
    (string | number)[]
  >([]);
  const [tagInput, setTagInput] = useState("");
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);

  const storiesQuery = useUserStoriesByProject(projectId, query);

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
    const stories = storiesQuery.data;
    if (!stories) return;

    setTags((current) => {
      const nextTags = new Map(current.map((tag) => [tag.id, tag]));
      let changed = false;

      stories.forEach((story) => {
        story.tags.forEach((tag, index) => {
          const tagId = slugify(tag.id) || tag.id;
          if (!nextTags.has(tagId)) {
            nextTags.set(tagId, {
              ...tag,
              id: tagId,
              color:
                tag.color ||
                TAG_COLORS[(nextTags.size + index) % TAG_COLORS.length],
            });
            changed = true;
          }
        });
      });

      return changed ? Array.from(nextTags.values()) : current;
    });

    setCards(stories.map((story) => cardFromStory(story, columns)));
  }, [columns, storiesQuery.data]);

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

  const canManageStories = useHasPermission("STORY_MANAGE");
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
    return cards.filter((card) => {
      const assignee = card.assigneeId ? userById.get(card.assigneeId) : null;

      const matchesStatus =
        statusFilter === "all" || card.columnId === statusFilter;
      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "me" && card.assigneeId === currentUserId) ||
        (assigneeFilter === "unassigned" && !card.assigneeId) ||
        card.assigneeId === assigneeFilter;
      const matchesTag = tagFilter === "all" || card.tagIds.includes(tagFilter);

      return matchesStatus && matchesAssignee && matchesTag;
    });
  }, [
    assigneeFilter,
    cards,
    currentUserId,
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
      assigned: cards.filter((card) => card.assigneeId).length,
    };
  }, [cards]);

  const isSavingStory =
    createStoryMutation.isPending ||
    updateStoryMutation.isPending ||
    updateStoryStatusMutation.isPending ||
    assignUsersMutation.isPending ||
    removeUsersMutation.isPending ||
    addTagMutation.isPending ||
    removeTagMutation.isPending ||
    addAttachmentMutation.isPending;

  const modalCommentCount = modalState?.cardId
    ? (cards.find((card) => card.id === modalState.cardId)?.commentCount ?? 0)
    : 0;

  const handleCommentCountChange = useCallback(
    (storyId: number, count: number) => {
      setCards((current) => {
        let changed = false;
        const next = current.map((card) => {
          if (card.storyId !== storyId || card.commentCount === count) {
            return card;
          }
          changed = true;
          return { ...card, commentCount: count };
        });
        return changed ? next : current;
      });
    },
    [],
  );

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
      storyId: card.storyId,
      draft: {
        title: card.title,
        description: card.description,
        epicId: card.epicId ?? null,
        columnId: card.columnId,
        assigneeId: card.assigneeId,
        tagIds: card.tagIds,
        endDate: card.endDate ?? null,
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
    const tagId = slugify(label);
    const existing = tags.find(
      (tag) =>
        tag.label.toLowerCase() === label.toLowerCase() || tag.id === tagId,
    );

    if (existing) {
      addTagToDraft(existing.id);
      setTagInput("");
      return;
    }

    const tag: KanbanTag = {
      id: tagId || createId("tag"),
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
    setModalState((current) => {
      if (!current) return current;

      const attachment = current.draft.attachments.find(
        (att) => att.id === attachmentId,
      );

      // Track deletion of existing attachments (those with attachmentId)
      if (attachment?.attachmentId) {
        setDeletedAttachmentIds((prev) => [
          ...prev,
          attachment.attachmentId as number,
        ]);
      }

      return {
        ...current,
        draft: {
          ...current.draft,
          attachments: current.draft.attachments.filter(
            (attachment) => attachment.id !== attachmentId,
          ),
        },
      };
    });
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

    if (previousUserIds.length > 0 && previousAssigneeId !== nextAssigneeId) {
      await removeUsersMutation.mutateAsync({
        storyId,
        payload: { userIds: previousUserIds },
      });
    }

    if (nextUserIds.length > 0 && previousAssigneeId !== nextAssigneeId) {
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
    const addedTagIds = nextTagIds.filter(
      (tagId) => !previousTagIds.includes(tagId),
    );
    const removedTagIds = previousTagIds.filter(
      (tagId) => !nextTagIds.includes(tagId),
    );

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

  async function uploadPendingAttachments(
    storyId: number,
    draft: KanbanDraft,
  ): Promise<KanbanAttachment[]> {
    const existingAttachments = draft.attachments.filter(
      (attachment) => !attachment.file,
    );

    // Delete removed attachments
    for (const attachmentId of deletedAttachmentIds) {
      try {
        await deleteAttachmentMutation.mutateAsync({
          storyId,
          attachmentId,
        });
      } catch (error) {
        console.error("Failed to delete attachment", error);
      }
    }
    setDeletedAttachmentIds([]);

    // Upload new attachments
    const pendingAttachments = draft.attachments.filter(
      (attachment) => attachment.file,
    );
    const uploadedAttachments: KanbanAttachment[] = [];

    for (const attachment of pendingAttachments) {
      if (attachment.file) {
        const uploadedAttachment = await addAttachmentMutation.mutateAsync({
          storyId,
          file: attachment.file,
          metadata: { description: attachment.name },
        });
        uploadedAttachments.push(uploadedAttachment);
      }
    }

    return [...existingAttachments, ...uploadedAttachments];
  }

  async function handleModalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modalState || !modalState.draft.title.trim() || isSavingStory) return;

    const projectNumber = Number(projectId);
    const statusId =
      columns.find((column) => column.id === modalState.draft.columnId)
        ?.statusId ?? null;

    if (modalState.mode === "edit" && modalState.cardId) {
      const previousCard = cards.find((card) => card.id === modalState.cardId);
      let syncedAttachments = modalState.draft.attachments;

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
          if (modalState.draft.endDate !== previousCard.endDate) {
            await updateStoryTimingMutation.mutateAsync({
              storyId: previousCard.storyId,
              payload: {
                endDate: modalState.draft.endDate ?? new Date().toISOString(),
              },
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
          syncedAttachments = await uploadPendingAttachments(
            previousCard.storyId,
            modalState.draft,
          );
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
                attachments: syncedAttachments,
                statusId,
                attachmentCount: syncedAttachments.length,
                updatedAt: new Date().toISOString(),
              }
            : card,
        ),
      );
      setLastAction(`Updated ${modalState.cardId}`);
    } else {
      let createdStoryId: number | undefined;
      let syncedAttachments = modalState.draft.attachments;
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
          if (modalState.draft.endDate) {
            await updateStoryTimingMutation.mutateAsync({
              storyId: created.id,
              payload: { endDate: modalState.draft.endDate },
            });
          }
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
          syncedAttachments = await uploadPendingAttachments(
            created.id,
            modalState.draft,
          );
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
        attachments: syncedAttachments,
        attachmentCount: syncedAttachments.length,
        commentCount: 0,
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
      JSON.stringify({ type: "card", cardId }),
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
      JSON.stringify({ type: "column", columnId }),
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
        statusId: targetColumn?.statusId ?? movingCard.statusId,
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
        console.log("Drag-drop: Updating story status", {
          storyId: previousCard.storyId,
          oldStatusId: previousCard.statusId,
          newStatusId: targetColumn.statusId,
        });

        const result = await updateStoryStatusMutation.mutateAsync({
          storyId: previousCard.storyId,
          payload: { statusId: targetColumn.statusId },
        });

        console.log("Drag-drop: Status update successful", result);
      } catch (error) {
        console.error("Drag-drop: Status update failed, rolling back", error);
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

  function handleColumnDrop(
    event: DragEvent<HTMLDivElement>,
    columnId: string,
  ) {
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
    if (
      !payload ||
      payload.type !== "card" ||
      payload.cardId === targetCard.id
    ) {
      return;
    }
    void moveCardToColumn(payload.cardId, targetCard.columnId, targetCard.id);
    setDraggingCardId(null);
    setActiveColumnId(null);
  }

  function reorderColumns(sourceColumnId: string, targetColumnId: string) {
    if (sourceColumnId === targetColumnId) return;

    setColumns((current) => {
      const fromIndex = current.findIndex(
        (column) => column.id === sourceColumnId,
      );
      const toIndex = current.findIndex(
        (column) => column.id === targetColumnId,
      );
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
        setLastAction((error as Error)?.message || "Could not create status");
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
        setLastAction((error as Error)?.message || "Could not delete status");
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
      <KanbanBoardHeader
        projectName={projectQuery.data?.name}
        boardTotals={boardTotals}
        query={query}
        statusFilter={statusFilter}
        assigneeFilter={assigneeFilter}
        tagFilter={tagFilter}
        filtersOpen={filtersOpen}
        statusesLoading={statusesQuery.isLoading}
        statusesError={statusesQuery.isError}
        columns={columns}
        users={users}
        tags={tags}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        onTagFilterChange={setTagFilter}
        onToggleFilters={() => setFiltersOpen((value) => !value)}
        onToggleAddColumn={() => setIsAddingColumn((value) => !value)}
        onNewStory={() => openCreateModal()}
        canCreateStory={canManageStories}
      />

      <div className="overflow-x-auto px-4 py-5 lg:px-8">
        <div
          className="grid min-h-[calc(100vh-15rem)] auto-cols-[minmax(18rem,22rem)] grid-flow-col gap-4 pb-4"
          aria-label="Kanban board"
        >
          {columns.map((column) => {
            const columnCards = cardsByColumn[column.id] ?? [];
            return (
              <KanbanBoardColumn
                key={column.id}
                column={column}
                cards={columnCards}
                tags={tagById}
                users={userById}
                active={activeColumnId === column.id}
                draggingColumn={draggingColumnId === column.id}
                draggingCardId={draggingCardId}
                deleteDisabled={
                  columnCards.length > 0 || deleteStatusMutation.isPending
                }
                onColumnDragStart={handleColumnDragStart}
                onColumnDragEnd={() => {
                  setDraggingColumnId(null);
                  setActiveColumnId(null);
                }}
                onColumnDragOver={setActiveColumnId}
                onColumnDragLeave={() => setActiveColumnId(null)}
                onColumnDrop={handleColumnDrop}
                onCardDragStart={handleDragStart}
                onCardDragEnd={() => {
                  setDraggingCardId(null);
                  setActiveColumnId(null);
                }}
                onCardDrop={handleCardDrop}
                onDeleteColumn={handleDeleteColumn}
                onEditCard={openEditModal}
              />
            );
          })}

          <AddColumnForm
            isAdding={isAddingColumn}
            columnName={columnName}
            isSaving={createStatusMutation.isPending}
            onColumnNameChange={setColumnName}
            onSubmit={handleAddColumn}
            onStart={() => setIsAddingColumn(true)}
            onCancel={() => {
              setIsAddingColumn(false);
              setColumnName("");
            }}
          />
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
          commentCount={modalCommentCount}
          isSaving={isSavingStory}
          onTagInputChange={setTagInput}
          onClose={() => setModalState(null)}
          onSubmit={handleModalSubmit}
          onDraftChange={updateDraft}
          onCreateTag={handleCreateTag}
          onAddTag={addTagToDraft}
          onRemoveTag={removeTagFromDraft}
          onFiles={handleFiles}
          onAttachmentInput={handleAttachmentInput}
          onRemoveAttachment={removeAttachment}
          onCommentMessage={setLastAction}
          onCommentCountChange={handleCommentCountChange}
        />
      )}
    </section>
  );
}
