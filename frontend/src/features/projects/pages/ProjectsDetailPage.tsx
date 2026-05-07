import { useParams, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useProject, useProjectMembers } from "@/features/projects/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function ProjectsDetailPage() {
  useDocumentTitle("Project");
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();

  const projectQuery = useProject(projectId);
  const membersQuery = useProjectMembers(projectId);

  // Check if this is a nested route (not the detail page index)
  const isDetailPage = location.pathname === `/projects/${projectId}`;

  return (
    <>
      {isDetailPage && (
        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Delivery</p>
            <h2 className="text-2xl font-semibold text-slate-950">
              {projectQuery.data?.name ?? "Project"}
            </h2>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-sm font-medium text-slate-700">
              Team Members
            </h3>
            <div className="space-y-2">
              {membersQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading members…</p>
              ) : (membersQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No members yet.</p>
              ) : (
                (membersQuery.data ?? []).map((m: any) => (
                  <div
                    key={m.userId}
                    className="flex items-center gap-3 rounded px-3 py-2 hover:bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">
                        {m.username}
                      </div>
                      <div className="text-xs text-slate-500">{m.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
      <Outlet />
    </>
  );
}
