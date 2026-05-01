import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProjectList } from '../components/ProjectList';
import { useProjects } from '../hooks';

export function ProjectsPage() {
  useDocumentTitle('Projects');

  const projectsQuery = useProjects();

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">Delivery</p>
          <h2 className="text-2xl font-semibold text-slate-950">Projects</h2>
        </div>
        <Button>
          <Plus className="size-4" aria-hidden="true" />
          New project
        </Button>
      </div>

      <ProjectList
        projects={projectsQuery.data ?? []}
        isLoading={projectsQuery.isLoading}
        isError={projectsQuery.isError}
        onRetry={() => void projectsQuery.refetch()}
      />
    </section>
  );
}
