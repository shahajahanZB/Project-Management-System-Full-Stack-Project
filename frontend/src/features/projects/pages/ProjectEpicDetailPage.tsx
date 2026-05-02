import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  useEpicById,
  useAssignEpicUsers,
  useRemoveEpicUsers,
} from "../epics/hooks";
import { useGetAllUsers } from "@/features/auth/hooks";

export function ProjectEpicDetailPage() {
  useDocumentTitle("Epic Detail");
  const { projectId, epicId } = useParams<{
    projectId: string;
    epicId: string;
  }>();
  const navigate = useNavigate();

  const epicQuery = useEpicById(epicId);
  const usersQuery = useGetAllUsers();
  const assignUsers = useAssignEpicUsers();
  const removeUsers = useRemoveEpicUsers();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const assignedUserIds = epicQuery.data?.assignedUserIds ?? [];
  const allUsers = usersQuery.data ?? [];

  const availableUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const candidates = allUsers.filter((u) => !assignedUserIds.includes(u.id));
    if (!q) return candidates.slice(0, 20);
    return candidates
      .filter(
        (u) =>
          String(u.username).toLowerCase().includes(q) ||
          String(u.email).toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [allUsers, query, assignedUserIds]);

  function toggleSelect(id: number) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  async function handleAddUsers() {
    if (!epicId || selected.length === 0) return;
    try {
      await assignUsers.mutateAsync({
        epicId,
        payload: { userIds: selected },
      });
      setSelected([]);
      setQuery("");
    } catch (err) {
      console.error("Failed to assign users:", err);
    }
  }

  async function handleRemoveUser(userId: number) {
    if (!epicId) return;
    try {
      await removeUsers.mutateAsync({
        epicId,
        payload: { userIds: [userId] },
      });
    } catch (err) {
      console.error("Failed to remove user:", err);
    }
  }

  if (epicQuery.isLoading) {
    return (
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(-1)} variant="ghost">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-sm font-medium text-slate-500">Loading…</p>
            <h2 className="text-2xl font-semibold text-slate-950">Epic</h2>
          </div>
        </div>
      </section>
    );
  }

  if (epicQuery.isError || !epicQuery.data) {
    return (
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(-1)} variant="ghost">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-sm font-medium text-slate-500">Error</p>
            <h2 className="text-2xl font-semibold text-slate-950">
              Epic not found
            </h2>
          </div>
        </div>
      </section>
    );
  }

  const epic = epicQuery.data;
  const assignedUsers = allUsers.filter((u) => assignedUserIds.includes(u.id));

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(-1)} variant="ghost">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-sm font-medium text-slate-500">Epic</p>
            <h2 className="text-2xl font-semibold text-slate-950">
              #{epic.id} {epic.name}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              {
                NEW: "bg-blue-100 text-blue-800",
                IN_PROGRESS: "bg-yellow-100 text-yellow-800",
                COMPLETED: "bg-green-100 text-green-800",
                ARCHIVED: "bg-slate-100 text-slate-800",
              }[epic.status] || "bg-slate-100 text-slate-800"
            }`}
          >
            {epic.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-950">
              Progress
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${epic.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-600 min-w-fit">
                {epic.progress}%
              </span>
            </div>
          </div>

          {/* Assignments */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-950">
              Assigned Users
            </h3>

            {assignedUsers.length === 0 ? (
              <p className="text-sm text-slate-500">No users assigned yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-slate-50"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {user.username}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add users */}
            <div className="border-t pt-4 mt-4">
              <label className="block mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Assign Users
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users…"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>

              {query && (
                <div className="max-h-48 overflow-auto rounded border bg-white p-2 mb-3">
                  {usersQuery.isLoading ? (
                    <p className="text-sm text-slate-500 p-2">Loading users…</p>
                  ) : availableUsers.length === 0 ? (
                    <p className="text-sm text-slate-500 p-2">
                      No users found.
                    </p>
                  ) : (
                    availableUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-slate-50 cursor-pointer"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {u.username}
                          </div>
                          <div className="text-xs text-slate-500">
                            {u.email}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selected.includes(u.id)}
                          onChange={() => toggleSelect(u.id)}
                          className="cursor-pointer"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {selected.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddUsers}
                    disabled={assignUsers.isPending}
                    className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {assignUsers.isPending
                      ? "Adding…"
                      : `Add ${selected.length} user(s)`}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelected([]);
                      setQuery("");
                    }}
                    variant="secondary"
                    disabled={assignUsers.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="rounded-lg border bg-white p-6 h-fit sticky top-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-950">Details</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase font-medium text-slate-500">ID</p>
              <p className="text-slate-900">#{epic.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-medium text-slate-500">
                Status
              </p>
              <p className="text-slate-900">{epic.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-medium text-slate-500">
                Progress
              </p>
              <p className="text-slate-900">{epic.progress}%</p>
            </div>
            <div>
              <p className="text-xs uppercase font-medium text-slate-500">
                Assigned Users
              </p>
              <p className="text-slate-900">{assignedUsers.length}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
