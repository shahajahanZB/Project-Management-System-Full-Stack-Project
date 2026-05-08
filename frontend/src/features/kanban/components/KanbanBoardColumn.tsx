import type { DragEvent } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KanbanCard, KanbanColumn, KanbanTag, KanbanUser } from "../types";
import { KanbanStoryCard } from "./KanbanStoryCard";

type KanbanBoardColumnProps = {
  column: KanbanColumn;
  cards: KanbanCard[];
  tags: Map<string, KanbanTag>;
  users: Map<string, KanbanUser>;
  active: boolean;
  draggingColumn: boolean;
  draggingCardId: string | null;
  deleteDisabled: boolean;
  onColumnDragStart: (
    event: DragEvent<HTMLDivElement>,
    columnId: string,
  ) => void;
  onColumnDragEnd: () => void;
  onColumnDragOver: (columnId: string) => void;
  onColumnDragLeave: () => void;
  onColumnDrop: (event: DragEvent<HTMLDivElement>, columnId: string) => void;
  onCardDragStart: (
    event: DragEvent<HTMLButtonElement>,
    cardId: string,
  ) => void;
  onCardDragEnd: () => void;
  onCardDrop: (
    event: DragEvent<HTMLButtonElement>,
    targetCard: KanbanCard,
  ) => void;
  onCreateStory: (columnId: string) => void;
  onDeleteColumn: (column: KanbanColumn) => void;
  onEditCard: (card: KanbanCard) => void;
};

export function KanbanBoardColumn({
  column,
  cards,
  tags,
  users,
  active,
  draggingColumn,
  draggingCardId,
  deleteDisabled,
  onColumnDragStart,
  onColumnDragEnd,
  onColumnDragOver,
  onColumnDragLeave,
  onColumnDrop,
  onCardDragStart,
  onCardDragEnd,
  onCardDrop,
  onCreateStory,
  onDeleteColumn,
  onEditCard,
}: KanbanBoardColumnProps) {
  return (
    <div
      draggable
      onDragStart={(event) => onColumnDragStart(event, column.id)}
      onDragEnd={onColumnDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
        onColumnDragOver(column.id);
      }}
      onDragLeave={onColumnDragLeave}
      onDrop={(event) => onColumnDrop(event, column.id)}
      className={cn(
        "flex max-h-[calc(100vh-13rem)] min-h-[28rem] flex-col rounded-md border border-slate-200 bg-slate-200/80 transition duration-200",
        active && "border-teal-400 bg-teal-50/80 shadow-soft",
        draggingColumn && "opacity-60",
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
            {cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCreateStory(column.id)}
            className="inline-flex size-8 items-center justify-center rounded text-slate-500 transition hover:bg-white hover:text-teal-700"
            title={`Add story to ${column.title}`}
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteColumn(column)}
            disabled={deleteDisabled}
            className="inline-flex size-8 items-center justify-center rounded text-slate-500 transition hover:bg-white hover:text-rose-700 disabled:pointer-events-none disabled:opacity-40"
            title={
              cards.length > 0
                ? "Move cards before deleting"
                : `Delete ${column.title}`
            }
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {cards.map((card) => (
          <KanbanStoryCard
            key={card.id}
            card={card}
            tags={tags}
            user={card.assigneeId ? users.get(card.assigneeId) : null}
            dragging={draggingCardId === card.id}
            onDragStart={onCardDragStart}
            onDrop={onCardDrop}
            onDragEnd={onCardDragEnd}
            onEdit={() => onEditCard(card)}
          />
        ))}
      </div>
    </div>
  );
}
