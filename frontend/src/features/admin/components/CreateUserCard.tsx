import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useQueryClient } from "@tanstack/react-query";
import { useGetAllRoles, useSignUpMutation } from "@/features/auth/hooks";

type Props = {
  onClose?: () => void;
};

export default function CreateUserCard({ onClose }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("1234");
  const [selectedRoleIds, setSelectedRoleIds] = useState<
    Array<number | string>
  >([]);

  const rolesQuery = useGetAllRoles();
  const queryClient = useQueryClient();
  const signUp = useSignUpMutation();

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
      // Ensure roleIds is an array of numbers when sending to API
      const roleIds = selectedRoleIds
        .map((r) => Number(r))
        .filter((n) => !Number.isNaN(n));
      await signUp.mutateAsync({ username, email, password, roleIds });
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
          Password
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
        <p className="mt-1 text-xs text-slate-500">
          Default password: <strong>1234</strong>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Roles
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {rolesQuery.data?.map((role: any, idx: number) => {
            const id = role?.id ?? role?.roleId ?? role?.role_id ?? role ?? idx;
            const name =
              role?.name ??
              role?.roleName ??
              role?.role_name ??
              role ??
              `role-${idx}`;
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
          disabled={signUp.isPending}
        >
          Create
        </Button>
        <Button type="button" className="bg-slate-100" onClick={onClose}>
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
