import { AlertCircle, Edit2, Plus, Trash2, Users, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CreateUserCard from "./CreateUserCard";
import EditUserCard from "./EditUserCard";
import {
  useGetAllRoles,
  useGetAllUsers,
  useSignUpMutation,
} from "@/features/auth/hooks";
import type { User } from "@/features/auth/types";

type UserManagementSectionProps = {
  users: User[] | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  isDarkMode: boolean;
  isDeleting: boolean;
  onDeleteUser: (userId: number) => void;
};

export function UserManagementSection({
  users,
  isLoading,
  isError,
  errorMessage,
  isDarkMode,
  isDeleting,
  onDeleteUser,
}: UserManagementSectionProps) {
  const navigate = useNavigate();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
          Loading users...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading users</h3>
            <p className="text-sm text-red-700">
              {errorMessage || "Unable to fetch users"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold">All Users</h3>
        <AddUserButton />
      </div>

      {(users?.length ?? 0) === 0 ? (
        <div
          className={
            isDarkMode
              ? "rounded-lg border border-slate-800 bg-slate-950 p-8 text-center"
              : "rounded-lg border border-slate-200 bg-slate-50 p-8 text-center"
          }
        >
          <Users className="mx-auto mb-3 size-8 text-slate-400" />
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
            No users found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={
                  isDarkMode
                    ? "border-b border-slate-800"
                    : "border-b border-slate-200"
                }
              >
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Roles
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr
                  key={user.id}
                  className={
                    isDarkMode
                      ? "border-b border-slate-800 hover:bg-slate-800/60"
                      : "border-b border-slate-200 hover:bg-slate-50"
                  }
                >
                  <td className="px-4 py-3 text-sm">{user.username}</td>
                  <td
                    className={
                      isDarkMode
                        ? "px-4 py-3 text-sm text-slate-300"
                        : "px-4 py-3 text-sm text-slate-600"
                    }
                  >
                    {user.email}
                  </td>
                  <td
                    className={
                      isDarkMode
                        ? "px-4 py-3 text-sm text-slate-300"
                        : "px-4 py-3 text-sm text-slate-600"
                    }
                  >
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700"
                          >
                            {role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className={
                          isDarkMode
                            ? "rounded-md bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                            : "rounded-md bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                        }
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        title="View details"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        className={
                          isDarkMode
                            ? "rounded-md bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                            : "rounded-md bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                        }
                        onClick={() => setEditingUser(user)}
                        title="Edit user"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        disabled={isDeleting}
                        className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200 disabled:opacity-50"
                        title="Delete user"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit ${editingUser.username}`}
        >
          <EditUserCard
            user={editingUser}
            onClose={() => setEditingUser(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function AddUserButton() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 text-white hover:bg-indigo-700"
      >
        <Plus className="size-4" />
        Add User
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create User">
        <CreateUserCard onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function AddUserForm({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const rolesQuery = useGetAllRoles();
  const usersQuery = useGetAllUsers();
  const queryClient = useQueryClient();
  const signUp = useSignUpMutation();

  const onToggleRole = (id: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp.mutateAsync({
        username,
        email,
        password,
        roleIds: selectedRoleIds,
      });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    } catch (err) {
      // error shown by mutation state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="rounded-md border p-2"
        />
        <input
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="rounded-md border p-2"
        />
        <input
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="rounded-md border p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Roles</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {rolesQuery.data?.map((role: any) => (
            <button
              key={role.id}
              type="button"
              onClick={() => onToggleRole(role.id)}
              className={
                "rounded-full border px-3 py-1 text-sm" +
                (selectedRoleIds.includes(role.id)
                  ? " bg-indigo-600 text-white"
                  : " bg-white text-slate-700")
              }
            >
              {role.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          className="bg-indigo-600 text-white hover:bg-indigo-700"
          disabled={signUp.isPending}
        >
          Create
        </Button>
        <Button type="button" onClick={onClose} className="bg-slate-100">
          Cancel
        </Button>
      </div>

      {signUp.isError && (
        <p className="text-sm text-red-600">
          {(signUp.error as any)?.message ?? "Failed to create user"}
        </p>
      )}
    </form>
  );
}
