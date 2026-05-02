import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ProjectCard } from "../components/ProjectCard";
import { useProjects } from "../hooks";

export function ProjectsPage() {
  useDocumentTitle("Projects");

  const projectsQuery = useProjects();
  const navigate = useNavigate();

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">Delivery</p>
          <h2 className="text-2xl font-semibold text-slate-950">Projects</h2>
        </div>
        <Button onClick={() => navigate("/projects/new")}>
          <Plus className="size-4" aria-hidden="true" />
          New project
        </Button>
      </div>

      {projectsQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-lg border bg-slate-100"
            />
          ))}
        </div>
      )}

      {projectsQuery.isError && (
        <div className="rounded-lg border bg-white p-8 text-center shadow-soft">
          <h2 className="text-base font-semibold text-slate-950">
            Projects could not be loaded
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Check that the Spring Boot API is running and serving GET
            /api/v1/projects.
          </p>
          <Button
            className="mt-5"
            variant="secondary"
            onClick={() => void projectsQuery.refetch()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      {!projectsQuery.isLoading &&
        !projectsQuery.isError &&
        (projectsQuery.data?.length ?? 0) === 0 && (
          <div className="rounded-lg border bg-white p-8 text-center shadow-soft">
            <h2 className="text-base font-semibold text-slate-950">
              No projects yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Create a new project to get started.
            </p>
            <Button className="mt-5" onClick={() => navigate("/projects/new")}>
              <Plus className="size-4" aria-hidden="true" />
              Create project
            </Button>
          </div>
        )}

      {!projectsQuery.isLoading &&
        !projectsQuery.isError &&
        (projectsQuery.data?.length ?? 0) > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(projectsQuery.data ?? []).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
    </section>
  );
}
