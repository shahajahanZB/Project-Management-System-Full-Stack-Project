import { Columns3, Filter, LayoutGrid, Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { KanbanColumn, KanbanTag, KanbanUser } from "../types";
import { SelectField } from "./SelectField";

type KanbanBoardHeaderProps = {
  projectName?: string;
  boardTotals: {
    cards: number;
    points: number;
    assigned: number;
  };
  query: string;
  statusFilter: string;
  assigneeFilter: string;
  tagFilter: string;
  filtersOpen: boolean;
  statusesLoading: boolean;
  statusesError: boolean;
  columns: KanbanColumn[];
  users: KanbanUser[];
  tags: KanbanTag[];
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onAssigneeFilterChange: (value: string) => void;
  onTagFilterChange: (value: string) => void;
  onToggleFilters: () => void;
  onToggleAddColumn: () => void;
  onCreateStory: () => void;
};

export function KanbanBoardHeader({
  projectName,
  boardTotals,
  query,
  statusFilter,
  assigneeFilter,
  tagFilter,
  filtersOpen,
  statusesLoading,
  statusesError,
  columns,
  users,
  tags,
  onQueryChange,
  onStatusFilterChange,
  onAssigneeFilterChange,
  onTagFilterChange,
  onToggleFilters,
  onToggleAddColumn,
  onCreateStory,
}: KanbanBoardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <LayoutGrid className="size-4 text-teal-600" />
            <span>{projectName ?? "Project"}</span>
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
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search cards"
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={onToggleFilters}
              className="border-slate-300"
            >
              <Filter className="size-4" />
              Filters
            </Button>
            <Button
              variant="secondary"
              onClick={onToggleAddColumn}
              className="border-slate-300"
            >
              <Columns3 className="size-4" />
              Add column
            </Button>
            <Button
              onClick={onCreateStory}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              <Plus className="size-4" />
              Story
            </Button>
          </div>
        </div>
      </div>

      {(filtersOpen || statusesLoading) && (
        <div className="mt-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          {statusesLoading && (
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Loading statuses...
            </div>
          )}
          {statusesError && (
            <p className="text-sm font-medium text-rose-600">
              Could not load backend statuses. Showing local board data.
            </p>
          )}
          {filtersOpen && (
            <div className="grid gap-3 md:grid-cols-3">
              <SelectField
                label="Status"
                value={statusFilter}
                onChange={onStatusFilterChange}
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
                onChange={onAssigneeFilterChange}
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
                onChange={onTagFilterChange}
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
  );
}
