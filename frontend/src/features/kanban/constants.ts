import type {
  KanbanColumn,
  KanbanPointKey,
  KanbanPoints,
  KanbanTag,
} from "./types";

export const POINT_KEYS: Array<{ key: KanbanPointKey; label: string }> = [
  { key: "ux", label: "UX" },
  { key: "design", label: "Design" },
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
];

export const TAG_COLORS = [
  "bg-cyan-100 text-cyan-800 ring-cyan-200",
  "bg-amber-100 text-amber-800 ring-amber-200",
  "bg-emerald-100 text-emerald-800 ring-emerald-200",
  "bg-rose-100 text-rose-800 ring-rose-200",
  "bg-violet-100 text-violet-800 ring-violet-200",
  "bg-slate-100 text-slate-700 ring-slate-200",
];

export const COLUMN_COLORS = [
  "bg-sky-400",
  "bg-amber-400",
  "bg-fuchsia-400",
  "bg-emerald-400",
  "bg-rose-400",
  "bg-indigo-400",
];

export const AVATAR_COLORS = [
  "bg-cyan-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
  "bg-slate-700",
];

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "new", title: "New", color: "bg-sky-400", sortOrder: 1 },
  { id: "done", title: "Done", color: "bg-emerald-400", sortOrder: 2 },
];

export const DEFAULT_TAGS: KanbanTag[] = [
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

export const EMPTY_POINTS: KanbanPoints = {
  ux: 0,
  design: 0,
  frontend: 0,
  backend: 0,
};
