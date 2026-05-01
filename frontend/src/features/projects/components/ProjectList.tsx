import { FolderKanban, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Project, ProjectStatus } from '../types';

type ProjectListProps = {
  projects: Project[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

const statusTone: Record<ProjectStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  PLANNING: 'neutral',
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  COMPLETED: 'neutral',
  ARCHIVED: 'danger',
};

const statusLabel: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On hold',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
};

export function ProjectList({ projects, isLoading, isError, onRetry }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border bg-white shadow-soft">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-b p-4 last:border-b-0">
            <div className="size-10 animate-pulse rounded-md bg-slate-100" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-72 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center shadow-soft">
        <h2 className="text-base font-semibold text-slate-950">Projects could not be loaded</h2>
        <p className="mt-2 text-sm text-slate-600">
          Check that the Spring Boot API is running and serving GET /projects.
        </p>
        <Button className="mt-5" variant="secondary" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center shadow-soft">
        <h2 className="text-base font-semibold text-slate-950">No projects yet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Create a project from the backend and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-soft">
      <div className="grid grid-cols-[1fr_120px_120px_160px] gap-4 border-b bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 max-md:hidden">
        <span>Project</span>
        <span>Status</span>
        <span>Tasks</span>
        <span>Owner</span>
      </div>
      <div className="divide-y">
        {projects.map((project) => (
          <article
            key={project.id}
            className="grid gap-4 p-4 md:grid-cols-[1fr_120px_120px_160px] md:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <FolderKanban className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-slate-950">{project.name}</h3>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                    {project.key}
                  </span>
                </div>
                {project.description ? (
                  <p className="mt-1 line-clamp-1 text-sm text-slate-600">{project.description}</p>
                ) : null}
              </div>
            </div>
            <StatusBadge tone={statusTone[project.status]}>{statusLabel[project.status]}</StatusBadge>
            <span className="text-sm text-slate-700">{project.taskCount} tasks</span>
            <span className="text-sm text-slate-700">{project.ownerName}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
