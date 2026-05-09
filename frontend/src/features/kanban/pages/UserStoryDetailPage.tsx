import { useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DEFAULT_TAGS } from "../constants";
import type { KanbanDraft } from "../types";
import { Avatar } from "../components/Avatar";
import { SelectField } from "../components/SelectField";
import { StoryCommentsPanel } from "../components/StoryCommentsPanel";
import {
  useUserStory,
  useUpdateUserStory,
  useUserStoryStatuses,
  useAssignableUsersForProject,
} from "../hooks";
import { useGetCurrentUser } from "@/features/auth/hooks";

export function UserStoryDetailPage() {
  useDocumentTitle("Story Details");
  const { projectId, storyId } = useParams<{
    projectId: string;
    storyId: string;
  }>();
  const navigate = useNavigate();

  const projectNumber = Number(projectId);
  const storyNumber = Number(storyId);

  // Fetch real data from API
  const storyQuery = useUserStory(storyNumber);
  const statusesQuery = useUserStoryStatuses(projectNumber);
  const usersQuery = useAssignableUsersForProject(projectNumber);
  const currentUserQuery = useGetCurrentUser();
  const updateStoryMutation = useUpdateUserStory(projectNumber);

  const [draft, setDraft] = useState<KanbanDraft>({
    title: "",
    description: "",
    epicId: null,
    columnId: "",
    assigneeId: null,
    tagIds: [],
    attachments: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [commentCount, setCommentCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update draft when story data loads
  const storyLoaded = storyQuery.data;
  if (storyLoaded && draft.title === "") {
    const firstAssignee =
      storyLoaded.assignees && storyLoaded.assignees.length > 0
        ? String(storyLoaded.assignees[0].id)
        : null;
    const tagIds =
      storyLoaded.tags && storyLoaded.tags.length > 0
        ? storyLoaded.tags.map((t) => t.id)
        : [];

    setDraft({
      title: storyLoaded.title ?? "",
      description: storyLoaded.description ?? "",
      epicId: storyLoaded.epicId ?? null,
      columnId: String(storyLoaded.statusId ?? ""),
      assigneeId: firstAssignee,
      tagIds,
      attachments: storyLoaded.attachments ?? [],
    });
  }

  const statuses = statusesQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const tags = DEFAULT_TAGS;
  const currentUserId = String(currentUserQuery.data?.id ?? "1");

  const selectedTags = draft.tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag) => tag !== undefined) as typeof tags;
  const availableTags = tags.filter((tag) => !draft.tagIds.includes(tag.id));

  // Convert UserStoryStatus to SelectField options
  const statusOptions = statuses.map((status) => ({
    value: String(status.id),
    label: status.name,
  }));

  function handleDraftChange(partial: Partial<KanbanDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function handleAddTag() {
    const tag = availableTags.find(
      (t) => t.label.toLowerCase() === tagInput.toLowerCase(),
    );
    if (tag && !draft.tagIds.includes(tag.id)) {
      setDraft((prev) => ({
        ...prev,
        tagIds: [...prev.tagIds, tag.id],
      }));
      setTagInput("");
    }
  }

  function handleRemoveTag(tagId: string) {
    setDraft((prev) => ({
      ...prev,
      tagIds: prev.tagIds.filter((id) => id !== tagId),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storyNumber) return;

    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      console.log("Saving story:", {
        storyId: storyNumber,
        title: draft.title.trim(),
        description: draft.description,
        epicId: draft.epicId ?? null,
      });

      const response = await updateStoryMutation.mutateAsync({
        storyId: storyNumber,
        payload: {
          title: draft.title.trim(),
          description: draft.description,
          epicId: draft.epicId ?? null,
        },
      });

      console.log("Save successful:", response);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save changes",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (storyQuery.isLoading || statusesQuery.isLoading || usersQuery.isLoading) {
    return (
      <section className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-slate-500" />
      </section>
    );
  }

  if (storyQuery.isError) {
    return (
      <section className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-slate-600">Failed to load story</p>
        <Button
          onClick={() => navigate(`/projects/${projectId}/kanban`)}
          variant="secondary"
        >
          Back to Kanban
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/projects/${projectId}/kanban`)}
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="size-4" />
          Back to Kanban
        </button>
        <p className="text-sm font-medium text-slate-500">Story</p>
        <h1 className="text-3xl font-semibold text-slate-950">
          {draft.title || "Untitled"}
        </h1>
      </div>

      {/* Content Grid */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="space-y-6">
          {/* Title */}
          <div className="rounded-lg border bg-white p-6">
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-500">
                Title
              </span>
              <input
                value={draft.title}
                onChange={(event) =>
                  handleDraftChange({ title: event.target.value })
                }
                required
                placeholder="Story title"
                className="mt-3 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-medium outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>

          {/* Status */}
          {statusOptions.length > 0 && (
            <div className="rounded-lg border bg-white p-6">
              <SelectField
                label="Status"
                value={draft.columnId}
                onChange={(value) => handleDraftChange({ columnId: value })}
                options={statusOptions}
              />
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-3">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Tags
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleRemoveTag(tag.id)}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white transition hover:opacity-80"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.label}
                      <span>×</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="Add tag"
                  list="available-tags"
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                <datalist id="available-tags">
                  {availableTags.map((tag) => (
                    <option key={tag.id} value={tag.label} />
                  ))}
                </datalist>
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={availableTags.length === 0}
                  className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-50"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="rounded-lg border bg-white p-6">
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-500">
                Description
              </span>
              <textarea
                value={draft.description}
                onChange={(event) =>
                  handleDraftChange({ description: event.target.value })
                }
                placeholder="Add description..."
                rows={6}
                className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>

          {/* Comments */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase text-slate-500">
                Comments
              </span>
              <span className="ml-2 text-xs text-slate-500">
                {commentCount}
              </span>
            </div>
            <StoryCommentsPanel
              storyId={storyNumber}
              users={users}
              currentUserId={currentUserId}
              onMessage={() => {}}
              onCommentCountChange={setCommentCount}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Status Badge */}
          <div className="rounded-lg border bg-white p-5">
            <div className="mb-3">
              <span className="text-xs font-bold uppercase text-slate-500">
                Current Status
              </span>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-semibold text-slate-600 truncate">
              {statuses.find((s) => String(s.id) === draft.columnId)?.name ||
                "Not Set"}
            </div>
          </div>

          {/* Assignee */}
          {users.length > 0 && (
            <div className="rounded-lg border bg-white p-5">
              <div className="mb-3">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Assignee
                </span>
              </div>
              <select
                value={draft.assigneeId ?? ""}
                onChange={(event) =>
                  handleDraftChange({ assigneeId: event.target.value || null })
                }
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Team */}
          {users.length > 0 && (
            <div className="rounded-lg border bg-white p-5">
              <div className="mb-3">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Team
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {users.slice(0, 6).map((user) => (
                  <Avatar key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button
            type="submit"
            disabled={isSaving || updateStoryMutation.isPending}
            className="w-full bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {isSaving || updateStoryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>

          {saveSuccess && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              ✓ Changes saved successfully!
            </div>
          )}

          {saveError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              ✗ {saveError}
            </div>
          )}

          {updateStoryMutation.isError && !saveError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              Failed to save changes
            </div>
          )}
        </aside>
      </form>
    </section>
  );
}
