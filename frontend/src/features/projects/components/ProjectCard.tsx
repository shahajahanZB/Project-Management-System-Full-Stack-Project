import { FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Project, ProjectStatus } from "../types";

type ProjectCardProps = {
  project: Project;
};

const statusLabel: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const statusTone: Record<
  ProjectStatus,
  "neutral" | "success" | "warning" | "danger"
> = {
  PLANNING: "neutral",
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "neutral",
  ARCHIVED: "danger",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}/team`)}
      className="group relative overflow-hidden rounded-lg border bg-white shadow-soft transition-all hover:shadow-md hover:border-indigo-200"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700 group-hover:bg-blue-100">
            <FolderKanban className="size-5" aria-hidden="true" />
          </div>
          <StatusBadge
            status={project.status}
            tone={statusTone[project.status]}
          />
        </div>

        <div className="mb-3 min-w-0 text-left">
          <h3 className="truncate text-base font-semibold text-slate-950">
            {project.name}
          </h3>
          {project.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {project.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-400 italic">No description</p>
          )}
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{project.taskCount} tasks</span>
            <span>{project.ownerName}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
