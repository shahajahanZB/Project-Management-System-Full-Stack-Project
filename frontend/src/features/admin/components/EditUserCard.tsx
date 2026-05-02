import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useQueryClient } from "@tanstack/react-query";
import { useGetAllRoles, useUpdateUserMutation } from "@/features/auth/hooks";
import type { User } from "@/features/auth/types";

type Props = {
  user: User;
  onClose?: () => void;
};

export default function EditUserCard({ user, onClose }: Props) {
  const [username, setUsername] = useState(user.username ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [selectedRoleIds, setSelectedRoleIds] = useState<
    Array<number | string>
  >((user.roles ?? []).map((r) => r.id));

  useEffect(() => {
    setUsername(user.username ?? "");
    setEmail(user.email ?? "");
    setSelectedRoleIds((user.roles ?? []).map((r) => r.id));
  }, [user]);

  const rolesQuery = useGetAllRoles();
  const queryClient = useQueryClient();
  const updateUser = useUpdateUserMutation();

  const adminRoleNames = ["ADMIN", "SUPERADMIN"];

  const onToggleRole = (id: number | string, roleName?: string) => {
    if (roleName && adminRoleNames.includes(roleName)) return; // prevent selecting admin
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const roleIds = selectedRoleIds
        .map((r) => Number(r))
        .filter((n) => !Number.isNaN(n));
      await updateUser.mutateAsync({
        userId: user.id,
        payload: { username, email, roleIds },
      });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose?.();
    } catch (err) {
      // leave error handling to mutation state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Roles
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {rolesQuery.data?.map((role: any, idx: number) => {
            const id = role?.id ?? role?.roleId ?? role ?? idx;
            const name = role?.name ?? role?.roleName ?? role ?? `role-${idx}`;
            const isAdmin = adminRoleNames.includes(name as string);
            const selected = selectedRoleIds.includes(id);
            return (
              <button
                key={String(id)}
                type="button"
                onClick={() => onToggleRole(id, name)}
                className={`rounded-full px-3 py-1 text-sm border ${selected ? "bg-indigo-600 text-white" : "bg-white text-slate-700"} ${isAdmin ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-100"}`}
                disabled={isAdmin}
                title={isAdmin ? "Assigning admin role is disabled" : undefined}
              >
                {String(name)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          className="bg-indigo-600 text-white hover:bg-indigo-700"
          disabled={updateUser.isPending}
        >
          Save
        </Button>
        <Button type="button" className="bg-slate-100" onClick={onClose}>
          Cancel
        </Button>
      </div>

      {updateUser.isError && (
        <p className="text-sm text-red-600">
          {(updateUser.error as any)?.message ?? "Failed to update user"}
        </p>
      )}
    </form>
  );
}
