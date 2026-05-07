import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  Download,
  Eye,
  Lock,
  MessageSquare,
  Paperclip,
  Plus,
  Save,
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
import {
  issuePriorityOptions,
  issueSeverityOptions,
  issueStatusOptions,
  issueTypeOptions,
} from "../constants";
import { IssueAvatar } from "../components/IssueAvatar";
import { IssueWorkspaceShell } from "../components/IssueWorkspaceShell";
import {
  useAddIssueCommentMutation,
  useCreateIssueTagMutation,
  useDeleteIssueAttachmentMutation,
  useDeleteIssueCommentMutation,
  useDeleteIssueMutation,
  useIssue,
  useIssueTags,
  useUpdateIssueCommentMutation,
  useUpdateIssueMutation,
  useUploadIssueAttachmentMutation,
} from "../hooks";
import type {
  Issue,
  IssueComment,
  IssuePriority,
  IssueSeverity,
  IssueStatus,
  IssueType,
  IssueUpdatePayload,
  IssueUser,
} from "../types";
import {
  buildIssueUsers,
  canComment,
  canDeleteIssue,
  canEditIssue,
  canManageComment,
  formatIssueDateTime,
  getUserName,
} from "../utils";

type DetailTab = "comments" | "activity" | "attachments";

export function IssueDetailPage() {
  const { projectId: projectIdParam, issueId: issueIdParam } = useParams<{
    projectId: string;
    issueId: string;
  }>();
  const projectId = Number(projectIdParam);
  const issueId = Number(issueIdParam);
  const hasProjectId = Number.isFinite(projectId) && projectId > 0;
  const hasIssueId = Number.isFinite(issueId) && issueId > 0;

  useDocumentTitle(hasIssueId ? `Issue #${issueId}` : "Issue");

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [activeTab, setActiveTab] = useState<DetailTab>("comments");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [message, setMessage] = useState("");

  const projectQuery = useProject(projectIdParam);
  const membersQuery = useProjectMembers(projectIdParam);
  const currentUserQuery = useGetCurrentUser();
  const issueQuery = useIssue(issueId, hasIssueId);
  const tagsQuery = useIssueTags();

  const updateIssueMutation = useUpdateIssueMutation(projectId, issueId);
  const deleteIssueMutation = useDeleteIssueMutation(projectId);
  const createTagMutation = useCreateIssueTagMutation();
  const addCommentMutation = useAddIssueCommentMutation(issueId);
  const updateCommentMutation = useUpdateIssueCommentMutation(issueId);
  const deleteCommentMutation = useDeleteIssueCommentMutation(issueId);
  const uploadAttachmentMutation = useUploadIssueAttachmentMutation(issueId);
  const deleteAttachmentMutation = useDeleteIssueAttachmentMutation(issueId);

  const users: IssueUser[] = useMemo(
    () => buildIssueUsers(membersQuery.data ?? [], currentUserQuery.data),
    [membersQuery.data, currentUserQuery.data],
  );

  const issue = issueQuery.data;
  const currentUser = currentUserQuery.data;
  const comments = issue?.comments ?? [];
  const activities = issue?.activities ?? [];
  const attachments = issue?.attachments ?? [];
  const tags = tagsQuery.data ?? [];
  const canEdit = issue ? canEditIssue(issue, currentUser) : false;
  const canDelete = issue ? canDeleteIssue(issue, currentUser) : false;
  const canAddComment = issue ? canComment(issue, currentUser) : false;
  const selectedTagIds = new Set(issue?.tags?.map((tag) => tag.id) ?? []);
  const selectedWatcherIds = new Set(
    issue?.watchers?.map((watcher) => watcher.userId) ?? [],
  );
  const availableTags = tags.filter((tag) => !selectedTagIds.has(tag.id));
  const availableWatcherUsers = users.filter(
    (user) => !selectedWatcherIds.has(user.id),
  );

  useEffect(() => {
    if (!issue) return;
    setTitleDraft(issue.title);
    setDescriptionDraft(issue.description);
  }, [issue]);

  if (!hasProjectId) return <Navigate to="/projects" replace />;
  if (!hasIssueId) return <Navigate to={`/projects/${projectId}/issues`} replace />;

  if (issue && issue.projectId !== projectId) {
    return (
      <Navigate
        to={`/projects/${issue.projectId}/issues/${issue.id}`}
        replace
      />
    );
  }

  const persistIssuePatch = (payload: IssueUpdatePayload, success: string) => {
    if (!canEdit) return;
    setMessage("");
    updateIssueMutation.mutate(payload, {
      onSuccess: () => setMessage(success),
      onError: () => setMessage("Issue changes could not be saved."),
    });
  };

  const saveTitle = () => {
    if (!issue) return;
    const title = titleDraft.trim();
    setIsEditingTitle(false);
    if (!title || title === issue.title) {
      setTitleDraft(issue.title);
      return;
    }
    persistIssuePatch({ title }, "Title saved.");
  };

  const saveDescription = () => {
    if (!issue) return;
    const description = descriptionDraft.trim();
    if (!description || description === issue.description) {
      setDescriptionDraft(issue.description);
      return;
    }
    persistIssuePatch({ description }, "Description saved.");
  };

  const handleSelectChange = <
    Key extends "status" | "type" | "priority" | "severity",
  >(
    key: Key,
    value: Issue[Key],
  ) => {
    persistIssuePatch({ [key]: value } as IssueUpdatePayload, "Issue saved.");
  };

  const handleAddExistingTag = (tagId: string) => {
    if (!issue) return;
    const tag = tags.find((item) => item.id === Number(tagId));
    if (!tag || selectedTagIds.has(tag.id)) return;
    persistIssuePatch(
      { tagIds: [...selectedTagIds, tag.id] },
      "Tag added.",
    );
    setIsAddingTag(false);
  };

  const handleCreateAndAddTag = async () => {
    if (!issue) return;
    const name = newTagName.trim();
    if (!name) return;

    const existingTag = tags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );

    try {
      const tag = existingTag ?? (await createTagMutation.mutateAsync(name));
      persistIssuePatch({ tagIds: [...selectedTagIds, tag.id] }, "Tag added.");
      setNewTagName("");
      setIsAddingTag(false);
    } catch {
      setMessage("Tag could not be saved.");
    }
  };

  const handleRemoveTag = (tagId: number) => {
    persistIssuePatch(
      { tagIds: [...selectedTagIds].filter((id) => id !== tagId) },
      "Tag removed.",
    );
  };

  const handleAddWatcher = (value: string) => {
    const userId = Number(value);
    if (!userId || selectedWatcherIds.has(userId)) return;
    persistIssuePatch(
      { watcherIds: [...selectedWatcherIds, userId] },
      "Watcher added.",
    );
  };

  const handleRemoveWatcher = (userId: number) => {
    persistIssuePatch(
      { watcherIds: [...selectedWatcherIds].filter((id) => id !== userId) },
      "Watcher removed.",
    );
  };

  const handleAddComment = () => {
    const content = commentDraft.trim();
    if (!content || !canAddComment) return;

    addCommentMutation.mutate(content, {
      onSuccess: () => {
        setCommentDraft("");
        setMessage("Comment added.");
      },
      onError: () => setMessage("Comment could not be saved."),
    });
  };

  const handleDeleteIssue = () => {
    if (!issue || !canDelete) return;
    const confirmed = window.confirm("Delete this issue?");
    if (!confirmed) return;

    deleteIssueMutation.mutate(issue.id, {
      onSuccess: () => navigate(`/projects/${projectId}/issues`),
      onError: () => setMessage("Issue could not be deleted."),
    });
  };

  const handleUploadAttachments = async (files: FileList | null) => {
    if (!files?.length || !canEdit) return;

    const selectedFiles = Array.from(files);
    setMessage("");

    try {
      await Promise.all(
        selectedFiles.map((file) => uploadAttachmentMutation.mutateAsync(file)),
      );
      setMessage(
        selectedFiles.length === 1
          ? "Attachment uploaded."
          : `${selectedFiles.length} attachments uploaded.`,
      );
    } catch {
      setMessage("One or more attachments could not be uploaded.");
    }
  };

  if (issueQuery.isLoading) {
    return (
      <IssueWorkspaceShell>
        <div className="space-y-5">
          <div className="h-10 w-80 animate-pulse rounded bg-slate-100" />
          <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </IssueWorkspaceShell>
    );
  }

  if (issueQuery.isError || !issue) {
    return (
      <IssueWorkspaceShell>
        <div className="rounded-lg border bg-white p-8 text-center shadow-soft">
          <AlertCircle className="mx-auto size-8 text-rose-500" />
          <h2 className="mt-3 text-base font-semibold text-slate-950">
            Issue could not be loaded
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Check that this issue exists and belongs to a project you can access.
          </p>
          <Link
            to={`/projects/${projectId}/issues`}
            className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Back to issues
          </Link>
        </div>
      </IssueWorkspaceShell>
    );
  }

  return (
    <IssueWorkspaceShell>
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <Link
              to={`/projects/${projectId}/issues`}
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Back to issues
            </Link>
            <p className="text-sm font-medium text-slate-500">
              {projectQuery.data?.name ?? "Project"} / Issue #{issue.id}
            </p>
            <div className="mt-1 flex min-w-0 items-center gap-3">
              {isEditingTitle ? (
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveTitle();
                    if (event.key === "Escape") {
                      setTitleDraft(issue.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="h-10 min-w-0 flex-1 rounded-md border border-indigo-300 px-3 text-2xl font-semibold text-slate-950 outline-none focus:ring-4 focus:ring-indigo-100"
                  disabled={!canEdit}
                />
              ) : (
                <button
                  className="min-w-0 text-left text-2xl font-semibold text-slate-950 hover:text-indigo-700 disabled:hover:text-slate-950"
                  onClick={() => canEdit && setIsEditingTitle(true)}
                  disabled={!canEdit}
                >
                  {issue.title}
                </button>
              )}
              {issue.isBlocked ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                  <Lock className="size-3.5" aria-hidden="true" />
                  Blocked
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                persistIssuePatch(
                  { isBlocked: !issue.isBlocked },
                  issue.isBlocked ? "Issue unblocked." : "Issue blocked.",
                )
              }
              disabled={!canEdit || updateIssueMutation.isPending}
            >
              <Lock className="size-4" aria-hidden="true" />
              {issue.isBlocked ? "Unblock" : "Block"}
            </Button>
            <Button
              onClick={handleDeleteIssue}
              disabled={!canDelete || deleteIssueMutation.isPending}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>

        {message ? (
          <div className="rounded-lg border bg-white px-4 py-3 text-sm text-slate-700 shadow-soft">
            {message}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="rounded-lg border bg-white p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-950">
                  Description
                </h3>
                <Button
                  variant="secondary"
                  onClick={saveDescription}
                  disabled={!canEdit || descriptionDraft.trim() === issue.description}
                >
                  <Save className="size-4" aria-hidden="true" />
                  Save
                </Button>
              </div>
              <textarea
                value={descriptionDraft}
                onChange={(event) => setDescriptionDraft(event.target.value)}
                className="min-h-44 w-full resize-y rounded-md border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
                disabled={!canEdit}
              />
            </div>

            <div className="rounded-lg border bg-white shadow-soft">
              <div className="flex h-12 items-center justify-between border-b px-4">
                <div className="flex h-full items-center gap-4">
                  <TabButton
                    active={activeTab === "comments"}
                    onClick={() => setActiveTab("comments")}
                  >
                    {comments.length} Comments
                  </TabButton>
                  <TabButton
                    active={activeTab === "activity"}
                    onClick={() => setActiveTab("activity")}
                  >
                    {activities.length} Activity Log
                  </TabButton>
                  <TabButton
                    active={activeTab === "attachments"}
                    onClick={() => setActiveTab("attachments")}
                  >
                    {attachments.length} Files
                  </TabButton>
                </div>
              </div>

              {activeTab === "comments" ? (
                <div className="p-5">
                  <textarea
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    className="min-h-24 w-full resize-y rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
                    placeholder="Add a comment"
                    disabled={!canAddComment}
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!commentDraft.trim() || !canAddComment}
                    >
                      <MessageSquare className="size-4" aria-hidden="true" />
                      Add comment
                    </Button>
                  </div>

                  <div className="mt-6 divide-y">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          users={users}
                          canManage={canManageComment(comment.userId, currentUser)}
                          onEdit={(commentId, content) =>
                            updateCommentMutation.mutate(
                              { commentId, content },
                              {
                                onSuccess: () => setMessage("Comment saved."),
                                onError: () =>
                                  setMessage("Comment could not be saved."),
                              },
                            )
                          }
                          onDelete={(commentId) =>
                            deleteCommentMutation.mutate(commentId, {
                              onSuccess: () => setMessage("Comment deleted."),
                              onError: () =>
                                setMessage("Comment could not be deleted."),
                            })
                          }
                        />
                      ))
                    ) : (
                      <p className="py-8 text-center text-sm text-slate-500">
                        No comments yet.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {activeTab === "activity" ? (
                <div className="divide-y p-5">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 py-4">
                        <IssueAvatar
                          name={getUserName(users, activity.performedBy)}
                          className="size-9 rounded-full bg-indigo-100 text-indigo-700"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-950">
                            {activity.action}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {getUserName(users, activity.performedBy)} -{" "}
                            {formatIssueDateTime(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No activity recorded yet.
                    </p>
                  )}
                </div>
              ) : null}

              {activeTab === "attachments" ? (
                <div className="p-5">
                  <div className="mb-4 flex justify-end">
                    <Button
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!canEdit || uploadAttachmentMutation.isPending}
                    >
                      <Upload className="size-4" aria-hidden="true" />
                      Upload
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        void handleUploadAttachments(event.target.files);
                        event.currentTarget.value = "";
                      }}
                    />
                  </div>
                  {attachments.length > 0 ? (
                    <div className="divide-y rounded-md border">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 px-3 py-2"
                        >
                          <Paperclip className="size-4 text-slate-400" />
                          <a
                            href={attachment.fileUrl ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 flex-1 truncate text-sm font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            {attachment.fileName}
                          </a>
                          <a
                            href={attachment.fileUrl ?? "#"}
                            title="View attachment"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-indigo-700"
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </a>
                          <a
                            href={attachment.fileUrl ?? "#"}
                            title="Download attachment"
                            download
                            className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-indigo-700"
                          >
                            <Download className="size-4" aria-hidden="true" />
                          </a>
                          {canEdit ? (
                            <button
                              onClick={() =>
                                deleteAttachmentMutation.mutate(attachment.id, {
                                  onSuccess: () =>
                                    setMessage("Attachment deleted."),
                                  onError: () =>
                                    setMessage(
                                      "Attachment could not be deleted.",
                                    ),
                                })
                              }
                              title="Delete attachment"
                              className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-700 disabled:hover:border-slate-300 disabled:hover:text-slate-500"
                      disabled={!canEdit}
                    >
                      <Upload className="size-5" aria-hidden="true" />
                      Upload files
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-5 rounded-lg border bg-white p-5 shadow-soft">
            <div className="grid grid-cols-2 gap-3">
              <MetaSelect
                label="Status"
                value={issue.status}
                options={issueStatusOptions}
                disabled={!canEdit}
                onChange={(value) =>
                  handleSelectChange("status", value as IssueStatus)
                }
              />
              <MetaSelect
                label="Type"
                value={issue.type}
                options={issueTypeOptions}
                disabled={!canEdit}
                onChange={(value) => handleSelectChange("type", value as IssueType)}
              />
              <MetaSelect
                label="Severity"
                value={issue.severity}
                options={issueSeverityOptions}
                disabled={!canEdit}
                onChange={(value) =>
                  handleSelectChange("severity", value as IssueSeverity)
                }
              />
              <MetaSelect
                label="Priority"
                value={issue.priority}
                options={issuePriorityOptions}
                disabled={!canEdit}
                onChange={(value) =>
                  handleSelectChange("priority", value as IssuePriority)
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
                value={issue.dueDate ?? ""}
                onChange={(event) =>
                  persistIssuePatch({ dueDate: event.target.value }, "Due date saved.")
                }
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
                disabled={!canEdit}
              />
            </label>

            <div className="space-y-3 border-t pt-5">
              <h3 className="text-sm font-semibold text-slate-950">Assignee</h3>
              <div className="flex items-center gap-3">
                <IssueAvatar
                  name={getUserName(users, issue.assigneeId)}
                  className="size-10 rounded-full bg-indigo-100 text-indigo-700"
                />
                <select
                  value={issue.assigneeId ?? ""}
                  onChange={(event) =>
                    persistIssuePatch(
                      { assigneeId: Number(event.target.value) },
                      "Assignee saved.",
                    )
                  }
                  className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
                  disabled={!canEdit}
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
                {(issue.tags ?? []).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex h-8 items-center gap-2 rounded-full bg-indigo-50 px-3 text-sm font-medium text-indigo-700"
                  >
                    {tag.name}
                    {canEdit ? (
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        title={`Remove ${tag.name}`}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </span>
                ))}
              </div>

              {canEdit && isAddingTag ? (
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
              ) : canEdit ? (
                <Button variant="secondary" onClick={() => setIsAddingTag(true)}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add tag
                </Button>
              ) : null}
            </div>

            <div className="space-y-3 border-t pt-5">
              <h3 className="text-sm font-semibold text-slate-950">Watchers</h3>
              <div className="space-y-2">
                {(issue.watchers ?? []).map((watcher) => (
                  <div key={watcher.userId} className="flex items-center gap-2">
                    <IssueAvatar
                      name={getUserName(users, watcher.userId)}
                      className="size-8 rounded-full bg-indigo-100 text-indigo-700"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                      {getUserName(users, watcher.userId)}
                    </span>
                    {canEdit ? (
                      <button
                        onClick={() => handleRemoveWatcher(watcher.userId)}
                        className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        title="Remove watcher"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              {canEdit ? (
                <select
                  defaultValue=""
                  onChange={(event) => {
                    handleAddWatcher(event.target.value);
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
              ) : null}
            </div>

            <div className="border-t pt-5 text-sm text-slate-600">
              <p>
                Created by{" "}
                <span className="font-medium text-slate-950">
                  {getUserName(users, issue.createdById)}
                </span>
              </p>
              <p className="mt-1">{formatIssueDateTime(issue.createdAt)}</p>
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
  disabled: boolean;
  onChange: (value: string) => void;
};

function MetaSelect({ label, value, options, disabled, onChange }: MetaSelectProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none disabled:bg-slate-50",
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

type TabButtonProps = {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
};

function TabButton({ active, children, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-full border-b-2 px-1 text-sm font-semibold",
        active
          ? "border-indigo-600 text-indigo-700"
          : "border-transparent text-slate-500 hover:text-slate-700",
      )}
    >
      {children}
    </button>
  );
}

type CommentItemProps = {
  comment: IssueComment;
  users: IssueUser[];
  canManage: boolean;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
};

function CommentItem({
  comment,
  users,
  canManage,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  useEffect(() => {
    setDraft(comment.content);
  }, [comment.content]);

  const save = () => {
    const content = draft.trim();
    if (!content || content === comment.content) {
      setIsEditing(false);
      return;
    }
    onEdit(comment.id, content);
    setIsEditing(false);
  };

  return (
    <article className="flex gap-4 py-5">
      <IssueAvatar
        name={getUserName(users, comment.userId)}
        className="size-10 rounded-full bg-indigo-100 text-indigo-700"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <strong className="text-sm font-semibold text-slate-950">
            {getUserName(users, comment.userId)}
          </strong>
          <span className="text-xs text-slate-500">
            {formatIssueDateTime(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-20 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
            <div className="mt-2 flex gap-2">
              <Button onClick={save}>
                <Save className="size-4" aria-hidden="true" />
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft(comment.content);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {comment.content}
          </p>
        )}

        {canManage && !isEditing ? (
          <div className="mt-3 flex items-center gap-3 text-xs font-semibold uppercase">
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="text-rose-600 hover:text-rose-700"
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
