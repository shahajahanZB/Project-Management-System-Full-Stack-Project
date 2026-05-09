import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useAddUserStoryComment,
  useDeleteUserStoryComment,
  useUpdateUserStoryComment,
  useUserStoryComments,
} from "../hooks";
import type { KanbanUser, UserStoryComment } from "../types";
import { Avatar } from "./Avatar";

type StoryCommentsPanelProps = {
  storyId?: number;
  users: KanbanUser[];
  currentUserId: string;
  onMessage: (message: string) => void;
  onCommentCountChange: (count: number) => void;
};

export function StoryCommentsPanel({
  storyId,
  users,
  currentUserId,
  onMessage,
  onCommentCountChange,
}: StoryCommentsPanelProps) {
  const [draft, setDraft] = useState("");
  const commentsQuery = useUserStoryComments(storyId);
  const addCommentMutation = useAddUserStoryComment(storyId);
  const updateCommentMutation = useUpdateUserStoryComment(storyId);
  const deleteCommentMutation = useDeleteUserStoryComment(storyId);
  const comments = commentsQuery.data ?? [];

  useEffect(() => {
    if (!commentsQuery.data) return;
    onCommentCountChange(commentsQuery.data.length);
  }, [commentsQuery.data, onCommentCountChange]);

  function handleAddComment() {
    const comment = draft.trim();
    if (!storyId || !comment) return;

    addCommentMutation.mutate(
      { comment },
      {
        onSuccess: () => {
          setDraft("");
          onMessage("Comment added");
        },
        onError: () => onMessage("Comment could not be saved"),
      },
    );
  }

  if (!storyId) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
        Save this story before adding comments.
      </div>
    );
  }

  return (
    <section className="rounded-md border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-100 px-3 py-2">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
          <MessageSquare className="size-4 text-teal-700" />
          {comments.length} Comments
        </span>
        {commentsQuery.isFetching && (
          <Loader2 className="size-4 animate-spin text-slate-400" />
        )}
      </div>

      <div className="p-3">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="Add a comment"
          className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            onClick={handleAddComment}
            disabled={!draft.trim() || addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageSquare className="size-4" />
            )}
            Comment
          </Button>
        </div>
      </div>

      <div className="divide-y border-t border-slate-200">
        {commentsQuery.isLoading ? (
          <p className="p-4 text-center text-sm text-slate-500">
            Loading comments...
          </p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <StoryCommentItem
              key={comment.id}
              comment={comment}
              users={users}
              currentUserId={currentUserId}
              isSaving={updateCommentMutation.isPending}
              isDeleting={deleteCommentMutation.isPending}
              onEdit={(commentId, content) =>
                updateCommentMutation.mutate(
                  { commentId, payload: { comment: content } },
                  {
                    onSuccess: () => onMessage("Comment saved"),
                    onError: () => onMessage("Comment could not be saved"),
                  },
                )
              }
              onDelete={(commentId) =>
                deleteCommentMutation.mutate(commentId, {
                  onSuccess: () => onMessage("Comment deleted"),
                  onError: () => onMessage("Comment could not be deleted"),
                })
              }
            />
          ))
        ) : (
          <p className="p-4 text-center text-sm text-slate-500">
            No comments yet.
          </p>
        )}
      </div>
    </section>
  );
}

type StoryCommentItemProps = {
  comment: UserStoryComment;
  users: KanbanUser[];
  currentUserId: string;
  isSaving: boolean;
  isDeleting: boolean;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
};

function StoryCommentItem({
  comment,
  users,
  currentUserId,
  isSaving,
  isDeleting,
  onEdit,
  onDelete,
}: StoryCommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.comment);
  const author = users.find((user) => user.id === String(comment.userId));
  const canManage =
    comment.userId !== null &&
    comment.userId !== undefined &&
    String(comment.userId) === currentUserId;

  useEffect(() => {
    setDraft(comment.comment);
  }, [comment.comment]);

  function save() {
    const nextComment = draft.trim();
    if (!nextComment || nextComment === comment.comment) {
      setDraft(comment.comment);
      setIsEditing(false);
      return;
    }

    onEdit(comment.id, nextComment);
    setIsEditing(false);
  }

  return (
    <article className="flex gap-3 p-4">
      <Avatar user={author} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">
            {author?.name ?? "Team member"}
          </p>
          {comment.createdAt && (
            <span className="text-xs text-slate-500">
              {formatCommentTime(comment.createdAt)}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={save}
                disabled={!draft.trim() || isSaving}
              >
                <Save className="size-4" />
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDraft(comment.comment);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {comment.comment}
          </p>
        )}

        {canManage && !isEditing && (
          <div className="mt-3 flex items-center gap-3 text-xs font-semibold uppercase">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-teal-700 hover:text-teal-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function formatCommentTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
