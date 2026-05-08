import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  Lock,
  MessageSquare,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useGetCurrentUser } from "@/features/auth/hooks";
import { useProject, useProjectMembers } from "@/features/projects/hooks";
import { cn } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { addIssueComment, uploadIssueAttachment } from "../api";
import {
  issuePriorityOptions,
  issueSeverityOptions,
  issueStatusOptions,
  issueTypeOptions,
} from "../constants";
import { IssueAvatar } from "../components/IssueAvatar";
import { IssueWorkspaceShell } from "../components/IssueWorkspaceShell";
import {
  useCreateIssueMutation,
  useCreateIssueTagMutation,
  useIssueTags,
} from "../hooks";
import type {
  IssueCreatePayload,
  IssuePriority,
  IssueSeverity,
  IssueStatus,
  IssueTag,
  IssueType,
  IssueUser,
} from "../types";
import { buildIssueUsers, getUserName } from "../utils";

function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
    if (typeof data === "object" && data && "error" in data) {
      const message = (data as { error?: unknown }).error;
      if (typeof message === "string") return message;
    }
  }
  if (error instanceof Error) return error.message;
  return "Issue could not be created. Please check the form and retry.";
}

type DraftState = {
  title: string;
  description: string;
  status: IssueStatus;
  type: IssueType;
  severity: IssueSeverity;
  priority: IssuePriority;
  assigneeId: number | "";
  dueDate: string;
  isBlocked: boolean;
  tags: IssueTag[];
  watcherIds: number[];
  initialComment: string;
};

const initialDraft: DraftState = {
  title: "",
  description: "",
  status: "NEW",
  type: "BUG",
  severity: "NORMAL",
  priority: "MEDIUM",
  assigneeId: "",
  dueDate: "",
  isBlocked: false,
  tags: [],
  watcherIds: [],
  initialComment: "",
};

export function IssueCreatePage() {
  const { projectId: projectIdParam } = useParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const hasProjectId = Number.isFinite(projectId) && projectId > 0;

  useDocumentTitle("New Project Issue");

  const navigate = useNavigate();
  const projectQuery = useProject(projectIdParam);
  const membersQuery = useProjectMembers(projectIdParam);
  const currentUserQuery = useGetCurrentUser();
  const tagsQuery = useIssueTags();
  const createIssueMutation = useCreateIssueMutation(projectId);
  const createTagMutation = useCreateIssueTagMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const users: IssueUser[] = useMemo(
    () => buildIssueUsers(membersQuery.data ?? [], currentUserQuery.data),
    [membersQuery.data, currentUserQuery.data],
  );

  const [draft, setDraft] = useState<DraftState>(initialDraft);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tags = tagsQuery.data ?? [];

  useEffect(() => {
    if (draft.assigneeId || users.length === 0) return;
    setDraft((current) => ({ ...current, assigneeId: users[0].id }));
  }, [draft.assigneeId, users]);

  const selectedTagIds = new Set(draft.tags.map((tag) => tag.id));
  const selectedWatcherIds = new Set(draft.watcherIds);
  const availableTags = tags.filter((tag) => !selectedTagIds.has(tag.id));
  const availableWatcherUsers = users.filter(
    (user) => !selectedWatcherIds.has(user.id),
  );

  const updateDraft = <Key extends keyof DraftState>(
    key: Key,
    value: DraftState[Key],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setValidationError("");
  };

  const handleAddExistingTag = (tagId: string) => {
    const tag = tags.find((item) => item.id === Number(tagId));
    if (!tag || selectedTagIds.has(tag.id)) return;
    updateDraft("tags", [...draft.tags, tag]);
    setIsAddingTag(false);
  };

  const handleCreateAndAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    const existingTag = tags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );

    try {
      const nextTag = existingTag ?? (await createTagMutation.mutateAsync(name));
      if (!selectedTagIds.has(nextTag.id)) {
        updateDraft("tags", [...draft.tags, nextTag]);
      }
      setNewTagName("");
      setIsAddingTag(false);
    } catch {
      setValidationError("Tag could not be saved. Please retry.");
    }
  };

  const handleSubmit = async () => {
    if (!hasProjectId || isSubmitting) return;
    if (!draft.dueDate) {
      setValidationError("Due Date is required.");
      return;
    }
    if (!draft.title.trim()) {
      setValidationError("Title is required.");
      return;
    }
    if (!draft.description.trim()) {
      setValidationError("Description is required.");
      return;
    }
    if (!draft.assigneeId) {
      setValidationError("Assignee is required.");
      return;
    }

    const payload: IssueCreatePayload = {
      assigneeId: draft.assigneeId ? Number(draft.assigneeId) : null,
      title: draft.title.trim(),
      description: draft.description.trim(),
      dueDate: draft.dueDate,
      isBlocked: draft.isBlocked,
      status: draft.status,
      type: draft.type,
      severity: draft.severity,
      priority: draft.priority,
      tagIds: draft.tags.map((tag) => tag.id),
      watcherIds: draft.watcherIds,
    };

    setIsSubmitting(true);
    try {
      const issue = await createIssueMutation.mutateAsync(payload);
      await Promise.all(
        attachments.map((file) => uploadIssueAttachment(issue.id, file)),
      );

      const initialComment = draft.initialComment.trim();
      if (initialComment) {
        await addIssueComment(issue.id, initialComment);
      }

      navigate(`/projects/${projectId}/issues/${issue.id}`);
    } catch (error) {
      setValidationError(getApiErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  if (!hasProjectId) return <Navigate to="/projects" replace />;

  return (
    <IssueWorkspaceShell>
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <Link
              to={`/projects/${projectId}/issues`}
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Back to issues
            </Link>
            <p className="text-sm font-medium text-slate-500">
              {projectQuery.data?.name ?? "Project"}
            </p>
            <h2 className="text-2xl font-semibold text-slate-950">
              New issue
            </h2>
          </div>
          <Button
            onClick={() => void handleSubmit()}
            disabled={createIssueMutation.isPending || isSubmitting}
          >
            <Plus className="size-4" aria-hidden="true" />
            Create issue
          </Button>
        </div>

        {validationError ? (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-4" aria-hidden="true" />
            {validationError}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="rounded-lg border bg-white p-5 shadow-soft">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Short, specific issue title"
                />
              </label>

              <label className="mt-5 block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Description
                </span>
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    updateDraft("description", event.target.value)
                  }
                  className="min-h-44 w-full resize-y rounded-md border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  placeholder="What happened, what you expected, and any useful context"
                />
              </label>
            </div>

            <div className="rounded-lg border bg-white p-5 shadow-soft">
              <div className="grid gap-5 xl:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Paperclip className="size-4" aria-hidden="true" />
                      Attachments
                    </h3>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-8 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Upload className="size-4" aria-hidden="true" />
                      Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        const selectedFiles = Array.from(
                          event.currentTarget.files ?? [],
                        );
                        if (selectedFiles.length > 0) {
                          setAttachments((current) => [
                            ...current,
                            ...selectedFiles,
                          ]);
                        }
                        event.currentTarget.value = "";
                      }}
                    />
                  </div>

                  {attachments.length > 0 ? (
                    <div className="divide-y rounded-md border">
                      {attachments.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center gap-3 px-3 py-2"
                        >
                          <Paperclip className="size-4 text-slate-400" />
                          <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                            {file.name}
                          </span>
                          <button
                            onClick={() =>
                              setAttachments((current) =>
                                current.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                            className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Remove attachment"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-700"
                    >
                      <Upload className="size-5" aria-hidden="true" />
                      Upload files
                    </button>
                  )}
                </div>

                <label className="block space-y-2">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <MessageSquare className="size-4" aria-hidden="true" />
                    Initial comment
                  </span>
                  <textarea
                    value={draft.initialComment}
                    onChange={(event) =>
                      updateDraft("initialComment", event.target.value)
                    }
                    className="min-h-32 w-full resize-y rounded-md border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Add a comment"
                  />
                </label>
              </div>
            </div>
          </div>

          <aside className="space-y-5 rounded-lg border bg-white p-5 shadow-soft">
            <div className="grid grid-cols-2 gap-3">
              <MetaSelect
                label="Status"
                value={draft.status}
                options={issueStatusOptions}
                onChange={(value) => updateDraft("status", value as IssueStatus)}
              />
              <MetaSelect
                label="Type"
                value={draft.type}
                options={issueTypeOptions}
                onChange={(value) => updateDraft("type", value as IssueType)}
              />
              <MetaSelect
                label="Severity"
                value={draft.severity}
                options={issueSeverityOptions}
                onChange={(value) =>
                  updateDraft("severity", value as IssueSeverity)
                }
              />
              <MetaSelect
                label="Priority"
                value={draft.priority}
                options={issuePriorityOptions}
                onChange={(value) =>
                  updateDraft("priority", value as IssuePriority)
                }
              />
            </div>

            <label className="block space-y-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays className="size-4" aria-hidden="true" />
                Due date
              </span>
              <input
                type="date"
                value={draft.dueDate}
                onChange={(event) => updateDraft("dueDate", event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <Lock className="size-4" aria-hidden="true" />
                Blocked
              </span>
              <input
                type="checkbox"
                checked={draft.isBlocked}
                onChange={(event) =>
                  updateDraft("isBlocked", event.target.checked)
                }
                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <div className="space-y-3 border-t pt-5">
              <h3 className="text-sm font-semibold text-slate-950">Assignee</h3>
              <div className="flex items-center gap-3">
                <IssueAvatar
                  name={getUserName(users, Number(draft.assigneeId))}
                  className="size-10 rounded-full bg-indigo-100 text-indigo-700"
                />
                <select
                  value={draft.assigneeId}
                  onChange={(event) =>
                    updateDraft(
                      "assigneeId",
                      event.target.value ? Number(event.target.value) : "",
                    )
                  }
                  className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="" disabled>
                    Select assignee
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 border-t pt-5">
              <h3 className="text-sm font-semibold text-slate-950">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {draft.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex h-8 items-center gap-2 rounded-full bg-indigo-50 px-3 text-sm font-medium text-indigo-700"
                  >
                    {tag.name}
                    <button
                      onClick={() =>
                        updateDraft(
                          "tags",
                          draft.tags.filter((item) => item.id !== tag.id),
                        )
                      }
                      title={`Remove ${tag.name}`}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>

              {isAddingTag ? (
                <div className="space-y-2">
                  <select
                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    defaultValue=""
                    onChange={(event) => handleAddExistingTag(event.target.value)}
                  >
                    <option value="" disabled>
                      Select existing tag
                    </option>
                    {availableTags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      value={newTagName}
                      onChange={(event) => setNewTagName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void handleCreateAndAddTag();
                      }}
                      className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      placeholder="New tag"
                    />
                    <Button onClick={() => void handleCreateAndAddTag()}>
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => setIsAddingTag(true)}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add tag
                </Button>
              )}
            </div>

            <div className="space-y-3 border-t pt-5">
              <h3 className="text-sm font-semibold text-slate-950">Watchers</h3>
              <div className="space-y-2">
                {draft.watcherIds.map((userId) => (
                  <div key={userId} className="flex items-center gap-2">
                    <IssueAvatar
                      name={getUserName(users, userId)}
                      className="size-8 rounded-full bg-indigo-100 text-indigo-700"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                      {getUserName(users, userId)}
                    </span>
                    <button
                      onClick={() =>
                        updateDraft(
                          "watcherIds",
                          draft.watcherIds.filter((id) => id !== userId),
                        )
                      }
                      className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      title="Remove watcher"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
              <select
                defaultValue=""
                onChange={(event) => {
                  const userId = Number(event.target.value);
                  if (userId && !selectedWatcherIds.has(userId)) {
                    updateDraft("watcherIds", [...draft.watcherIds, userId]);
                  }
                  event.currentTarget.value = "";
                }}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  Add watcher
                </option>
                {availableWatcherUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </aside>
        </div>
      </section>
    </IssueWorkspaceShell>
  );
}

type MetaSelectProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

function MetaSelect({ label, value, options, onChange }: MetaSelectProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none",
          "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
