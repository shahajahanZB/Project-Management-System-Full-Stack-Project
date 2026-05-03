import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useGetAllUsers, useGetCurrentUser } from "@/features/auth/hooks";
import {
  useAddProjectMembers,
  useProject,
  useProjectMembers,
  useRemoveProjectMembers,
} from "@/features/projects/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type ProjectMember = {
  userId: number;
  username: string;
  email: string;
  isOwner?: boolean;
};

function toMember(item: any): ProjectMember {
  return {
    userId: Number(item?.userId ?? item?.id ?? 0),
    username: String(item?.username ?? item?.name ?? "Unknown User"),
    email: String(item?.email ?? ""),
  };
}

export function ProjectTeamPage() {
  useDocumentTitle("Team Management");
  const { projectId } = useParams<{ projectId: string }>();

  const projectQuery = useProject(projectId);
  const membersQuery = useProjectMembers(projectId);
  const usersQuery = useGetAllUsers();
  const currentUserQuery = useGetCurrentUser();
  const addMembers = useAddProjectMembers();
  const removeMembers = useRemoveProjectMembers();

  const usersErrorStatus =
    (usersQuery.error as any)?.response?.status ??
    (usersQuery.error as any)?.status;
  const isUsersForbidden = usersErrorStatus === 403;

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const members = useMemo(
    () => (membersQuery.data ?? []).map(toMember).filter((m) => m.userId > 0),
    [membersQuery.data],
  );

  const ownerFallbackMember = useMemo(() => {
    const projectOwner = projectQuery.data?.ownerName?.trim().toLowerCase();
    const currentUsername =
      currentUserQuery.data?.username?.trim().toLowerCase() ?? "";
    const currentUserId = currentUserQuery.data?.id;

    if (!projectOwner || !currentUsername || projectOwner !== currentUsername) {
      return null;
    }

    if (!currentUserId || members.some((m) => m.userId === currentUserId)) {
      return null;
    }

    return {
      userId: currentUserId,
      username: currentUserQuery.data?.username ?? "Owner",
      email: currentUserQuery.data?.email ?? "",
      isOwner: true,
    } as ProjectMember;
  }, [projectQuery.data?.ownerName, currentUserQuery.data, members]);

  const displayMembers = useMemo(
    () => (ownerFallbackMember ? [ownerFallbackMember, ...members] : members),
    [ownerFallbackMember, members],
  );

  const memberIds = useMemo(
    () => displayMembers.map((m) => m.userId),
    [displayMembers],
  );

  const availableUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const users = (usersQuery.data ?? []).filter(
      (u) => !memberIds.includes(u.id),
    );
    if (!q) return users;
    return users.filter(
      (u) =>
        String(u.username).toLowerCase().includes(q) ||
        String(u.email).toLowerCase().includes(q),
    );
  }, [usersQuery.data, memberIds, query]);

  function toggleSelect(userId: number) {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  async function handleAddMembers() {
    if (!projectId || selected.length === 0) return;
    try {
      await addMembers.mutateAsync({
        projectId,
        payload: { userIds: selected },
      });
      setSelected([]);
      setQuery("");
    } catch (error) {
      console.error("Failed to add members:", error);
    }
  }

  async function handleRemoveMember(userId: number) {
    if (!projectId) return;
    try {
      await removeMembers.mutateAsync({
        projectId,
        payload: { userIds: [userId] },
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Project</p>
        <h2 className="text-2xl font-semibold text-slate-950">
          {projectQuery.data?.name ?? "Team Management"}
        </h2>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-950">
          Current Members
        </h3>

        {membersQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading members...</p>
        ) : displayMembers.length === 0 ? (
          <p className="text-sm text-slate-500">
            No members in this project yet.
          </p>
        ) : (
          <div className="space-y-2">
            {displayMembers.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-slate-50"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    {member.username}
                    {member.isOwner ? (
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                        Owner
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-slate-500">{member.email}</div>
                </div>
                {member.isOwner ? null : (
                  <Button
                    variant="secondary"
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={removeMembers.isPending}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-950">
          Add Members
        </h3>
        <label className="block">
          <span className="text-sm text-slate-600">
            Search users by name or email
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="mt-3 max-h-64 overflow-auto rounded border bg-white p-2">
          {usersQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading users...</p>
          ) : isUsersForbidden ? (
            <p className="text-sm text-red-600">
              You do not have permission to list all users (403). Ask admin to
              grant access, or use a project-scoped endpoint like /v1/projects/
              {"{"}projectId{"}"}/assignable-users.
            </p>
          ) : usersQuery.isError ? (
            <p className="text-sm text-red-600">Failed to load users.</p>
          ) : !usersQuery.data || usersQuery.data.length === 0 ? (
            <p className="text-sm text-slate-500">No users found in system.</p>
          ) : availableUsers.length === 0 ? (
            <p className="text-sm text-slate-500">
              No users available to add (all members already added).
            </p>
          ) : (
            availableUsers.map((user) => (
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
                <input
                  type="checkbox"
                  checked={selected.includes(user.id)}
                  onChange={() => toggleSelect(user.id)}
                />
              </div>
            ))
          )}
        </div>

        <div className="mt-3 flex gap-3">
          <Button
            onClick={handleAddMembers}
            disabled={selected.length === 0 || addMembers.isPending}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {addMembers.isPending
              ? "Adding..."
              : `Add selected${selected.length ? ` (${selected.length})` : ""}`}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSelected([]);
              setQuery("");
            }}
            disabled={addMembers.isPending}
          >
            Clear
          </Button>
        </div>
      </div>
    </section>
  );
}
