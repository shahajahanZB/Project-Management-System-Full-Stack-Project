import { useMemo, useState } from "react";
import { useParams, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  useProject,
  useProjectMembers,
  useAddProjectMembers,
  useRemoveProjectMembers,
} from "@/features/projects/hooks";
import { useGetAllUsers } from "@/features/auth/hooks";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function ProjectsDetailPage() {
  useDocumentTitle("Project");
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const projectQuery = useProject(projectId);
  const membersQuery = useProjectMembers(projectId);

  const usersQuery = useGetAllUsers();
  const allUsers = usersQuery.data ?? [];

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const memberIds = (membersQuery.data ?? []).map((m: any) => m.userId);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const candidates = allUsers.filter((u) => !memberIds.includes(u.id));
    if (!q) return candidates.slice(0, 20);
    return candidates
      .filter(
        (u) =>
          String(u.username).toLowerCase().includes(q) ||
          String(u.email).toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [allUsers, query, memberIds]);

  const addMembers = useAddProjectMembers();
  const removeMembers = useRemoveProjectMembers();

  function toggleSelect(id: number) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  async function handleAdd() {
    if (!projectId || selected.length === 0) return;
    try {
      await addMembers.mutateAsync({
        projectId,
        payload: { userIds: selected },
      });
      setSelected([]);
      setQuery("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemove(userId: number) {
    if (!projectId) return;
    try {
      await removeMembers.mutateAsync({
        projectId,
        payload: { userIds: [userId] },
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Check if this is a nested route (not the detail page index)
  const isDetailPage = location.pathname === `/projects/${projectId}`;

  return (
    <>
      {isDetailPage && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Delivery</p>
              <h2 className="text-2xl font-semibold text-slate-950">
                {projectQuery.data?.name ?? "Project"}
              </h2>
            </div>
            <div>
              <Button onClick={() => navigate("/projects")}>Back</Button>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <p className="mb-4 text-sm text-slate-600">
              {projectQuery.data?.description}
            </p>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-700">Members</h3>
              <div className="mt-2 space-y-2">
                {membersQuery.isLoading ? (
                  <p className="text-sm text-slate-500">Loading members…</p>
                ) : (membersQuery.data ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">No members yet.</p>
                ) : (
                  (membersQuery.data ?? []).map((m: any) => (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-slate-50"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {m.username}
                        </div>
                        <div className="text-xs text-slate-500">{m.email}</div>
                      </div>
                      <div>
                        <Button
                          variant="secondary"
                          onClick={() => handleRemove(m.userId)}
                          className="text-red-600 hover:bg-red-50 border-red-200"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block">
                <span className="text-sm text-slate-600">Add members</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users by name or email"
                  className="mt-1 w-full rounded border px-3 py-2"
                />
              </label>

              <div className="max-h-64 overflow-auto rounded border bg-white p-2 mt-2">
                {usersQuery.isLoading ? (
                  <p className="text-sm text-slate-500">Loading users…</p>
                ) : results.length === 0 ? (
                  <p className="text-sm text-slate-500">No users found.</p>
                ) : (
                  results.map((u: any) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-slate-50"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {u.username}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          checked={selected.includes(u.id)}
                          onChange={() => toggleSelect(u.id)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 flex gap-3">
                <Button
                  onClick={handleAdd}
                  className="bg-indigo-600 text-white"
                >
                  Add selected
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelected([]);
                    setQuery("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
      <Outlet />
    </>
  );
}
