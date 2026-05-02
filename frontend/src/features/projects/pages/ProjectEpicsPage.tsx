import { Plus, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEpicsByProject, useCreateEpic } from "../epics/hooks";
import { EpicCreateModal } from "../epics/EpicCreateModal";
import { EpicListTable } from "../epics/EpicListTable";

export function ProjectEpicsPage() {
  useDocumentTitle("Epics");
  const { projectId } = useParams<{ projectId: string }>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const epicsQuery = useEpicsByProject(projectId);
  const createEpic = useCreateEpic();

  const handleCreateEpic = async (name: string) => {
    if (!projectId) return;
    try {
      await createEpic.mutateAsync({
        projectId,
        name,
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create epic:", error);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Project</p>
          <h2 className="text-2xl font-semibold text-slate-950">Epics</h2>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add Epic
        </Button>
      </div>

      {epicsQuery.isLoading && (
        <div className="rounded-lg border bg-white p-8 text-center shadow-soft">
          <p className="text-slate-500">Loading epics…</p>
        </div>
      )}

      {epicsQuery.isError && (
        <div className="rounded-lg border bg-white p-8 text-center shadow-soft">
          <h2 className="text-base font-semibold text-slate-950">
            Failed to load epics
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Please check your connection and try again.
          </p>
          <Button
            className="mt-5"
            variant="secondary"
            onClick={() => void epicsQuery.refetch()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      {!epicsQuery.isLoading && !epicsQuery.isError && (
        <EpicListTable epics={epicsQuery.data ?? []} />
      )}

      {isCreateModalOpen && (
        <EpicCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateEpic}
          isLoading={createEpic.isPending}
        />
      )}
    </section>
  );
}
