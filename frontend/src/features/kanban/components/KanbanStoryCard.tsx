import type { DragEvent } from "react";
import {
  CircleUserRound,
  GripVertical,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KanbanCard, KanbanTag, KanbanUser } from "../types";
import { initials, totalPoints } from "../utils";

type KanbanStoryCardProps = {
  card: KanbanCard;
  tags: Map<string, KanbanTag>;
  user: KanbanUser | null | undefined;
  dragging: boolean;
  onDragStart: (event: DragEvent<HTMLButtonElement>, cardId: string) => void;
  onDragEnd: () => void;
  onDrop: (event: DragEvent<HTMLButtonElement>, targetCard: KanbanCard) => void;
  onEdit: () => void;
};

export function KanbanStoryCard({
  card,
  tags,
  user,
  dragging,
  onDragStart,
  onDragEnd,
  onDrop,
  onEdit,
}: KanbanStoryCardProps) {
  const cardTags = card.tagIds
    .map((tagId) => tags.get(tagId))
    .filter(Boolean) as KanbanTag[];
  const attachmentCount = card.attachmentCount ?? card.attachments.length;
  const commentCount = card.commentCount ?? 0;

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
            {attachmentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <Paperclip className="size-3.5" />
                {attachmentCount}
              </span>
            )}
            {commentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <MessageSquare className="size-3.5" />
                {commentCount}
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
