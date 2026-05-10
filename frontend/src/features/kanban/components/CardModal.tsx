import { useCallback, type ChangeEvent, type FormEvent } from "react";
import {
  ChevronDown,
  CalendarDays,
  Loader2,
  Plus,
  Tag,
  UploadCloud,
  UserRoundCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type {
  CardModalState,
  KanbanDraft,
  KanbanTag,
  KanbanUser,
} from "../types";
import { formatBytes } from "../utils";
import { Avatar } from "./Avatar";
import { MetricButton } from "./MetricButton";
import { SelectField } from "./SelectField";
import { StoryCommentsPanel } from "./StoryCommentsPanel";

type CardModalProps = {
  state: CardModalState;
  columns: Array<{ id: string; title: string }>;
  users: KanbanUser[];
  tags: KanbanTag[];
  currentUserId: string;
  tagInput: string;
  commentCount: number;
  isSaving: boolean;
  onTagInputChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftChange: (partial: Partial<KanbanDraft>) => void;
  onCreateTag: () => void;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onFiles: (files: FileList | File[]) => void;
  onAttachmentInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onCommentMessage: (message: string) => void;
  onCommentCountChange: (storyId: number, count: number) => void;
};

export function CardModal({
  state,
  columns,
  users,
  tags,
  currentUserId,
  tagInput,
  commentCount,
  isSaving,
  onTagInputChange,
  onClose,
  onSubmit,
  onDraftChange,
  onCreateTag,
  onAddTag,
  onRemoveTag,
  onFiles,
  onAttachmentInput,
  onRemoveAttachment,
  onCommentMessage,
  onCommentCountChange,
}: CardModalProps) {
  const draft = state.draft;
  const selectedTags = draft.tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter(Boolean) as KanbanTag[];
  const availableTags = tags.filter((tag) => !draft.tagIds.includes(tag.id));
  const handleStoryCommentCountChange = useCallback(
    (count: number) => {
      if (state.storyId) onCommentCountChange(state.storyId, count);
    },
    [onCommentCountChange, state.storyId],
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="mx-auto my-6 grid w-full max-w-6xl gap-6 rounded-md bg-white p-5 shadow-2xl md:grid-cols-[minmax(0,1fr)_20rem] md:p-7"
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
              onChange={(event) => onDraftChange({ title: event.target.value })}
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
              required={state.mode === "create"}
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

          {state.mode === "edit" && (
            <StoryCommentsPanel
              storyId={state.storyId}
              users={users}
              currentUserId={currentUserId}
              onMessage={onCommentMessage}
              onCommentCountChange={handleStoryCommentCountChange}
            />
          )}
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
                <Avatar
                  user={users.find((user) => user.id === draft.assigneeId)}
                />
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
            <p className="text-xs font-bold uppercase text-slate-500">
              Due Date
            </p>
            <div className="mt-2">
              <label className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  value={
                    draft.endDate
                      ? new Date(draft.endDate).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      onDraftChange({ endDate: null });
                    } else {
                      const date = new Date(value);
                      onDraftChange({ endDate: date.toISOString() });
                    }
                  }}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="No due date"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetricButton label="Comments" value={String(commentCount)} />
            <MetricButton label="Team" value={String(users.length)} />
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-11 w-full bg-teal-500 text-slate-950 hover:bg-teal-400"
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {state.mode === "create" ? "Create" : "Save changes"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
