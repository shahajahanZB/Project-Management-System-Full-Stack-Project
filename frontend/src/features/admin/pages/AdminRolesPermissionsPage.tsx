import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import { AlertCircle, Plus, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  useGetAllRoles,
  useDeleteRoleMutation,
  useCreateRoleMutation,
  useGetAllPermissions,
  useAssignPermissionsToRoleMutation,
} from "@/features/auth/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { Role } from "@/features/auth/types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type Context = { isDarkMode: boolean };

export default function AdminRolesPermissionsPage() {
  useDocumentTitle("Admin - Roles & Permissions");
  const { isDarkMode } = useOutletContext<Context>();
  const queryClient = useQueryClient();

  const rolesQuery = useGetAllRoles();
  const deleteRoleMutation = useDeleteRoleMutation();
  const createRoleMutation = useCreateRoleMutation();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    [],
  );
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  const permissionsQuery = useGetAllPermissions();
  const assignPermissionsMutation = useAssignPermissionsToRoleMutation();

  const adminRoleNames = ["ADMIN", "SUPERADMIN"];

  const getRoleId = (role: any) => role?.id ?? role?.roleId;
  const getRoleName = (role: any) =>
    role?.name ?? role?.roleName ?? String(getRoleId(role) ?? role);
  const getPermissionCount = (role: any) => {
    if (typeof role?.permissionCount === "number") return role.permissionCount;
    if (Array.isArray(role?.permissions)) return role.permissions.length;
    return 0;
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    if (selectedPermissionIds.length === 0) {
      alert("Select at least one permission before creating a role");
      return;
    }
    // prevent creating admin roles
    if (adminRoleNames.includes(newRoleName.trim().toUpperCase())) {
      alert("Creating an admin role is not allowed");
      return;
    }
    // prevent duplicate role names
    if (
      rolesQuery.data?.some(
        (r: any) =>
          (r?.name ?? String(r)).toLowerCase() ===
          newRoleName.trim().toLowerCase(),
      )
    ) {
      alert("Role with this name already exists");
      return;
    }
    try {
      const created = await createRoleMutation.mutateAsync({
        name: newRoleName,
      });
      if (!created?.id)
        throw new Error("Role created but role ID was not returned");
      // Required flow: create role first, then assign selected permissions to that new role.
      await assignPermissionsMutation.mutateAsync({
        roleId: created.id,
        payload: { permissionIds: selectedPermissionIds },
      });
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      setNewRoleName("");
      setSelectedPermissionIds([]);
      setOpenCreateModal(false);
    } catch (_err) {
      // error shown by mutation state
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    const role = rolesQuery.data?.find((r: any) => getRoleId(r) === roleId);
    const roleName = getRoleName(role);
    if (adminRoleNames.includes((roleName ?? "").toUpperCase())) {
      alert("Cannot delete admin role");
      return;
    }
    const ok = window.confirm("Are you sure you want to delete this role?");
    if (!ok) return;
    try {
      await deleteRoleMutation.mutateAsync(roleId);
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
    } catch (err) {
      alert((err as any)?.message ?? "Failed to delete role");
    }
  };

  if (rolesQuery.isLoading) {
    return (
      <div
        className={`py-8 text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
      >
        Loading roles...
      </div>
    );
  }

  if (rolesQuery.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading roles</h3>
            <p className="text-sm text-red-700">
              {(rolesQuery.error as Error)?.message ?? "Unable to fetch roles"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Roles & Permissions
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => setOpenCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Plus className="size-4" />
          Create Role
        </Button>
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          setNewRoleName("");
          setSelectedPermissionIds([]);
        }}
        title="Create New Role"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateRole();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Role Name
            </label>
            <input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
              placeholder="Enter role name"
              className="mt-1 w-full rounded-md border px-3 py-2"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Select Permissions
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.values(permissionsQuery.data ?? {})
                .flat()
                .map((perm: any) => {
                  const id = perm?.id ?? perm;
                  const selected = selectedPermissionIds.includes(id);
                  return (
                    <button
                      key={String(id)}
                      type="button"
                      onClick={() =>
                        setSelectedPermissionIds((prev) =>
                          prev.includes(id)
                            ? prev.filter((p) => p !== id)
                            : [...prev, id],
                        )
                      }
                      className={`rounded-full px-3 py-1 text-sm border ${selected ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`}
                    >
                      {perm.access ?? String(id)}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={
                createRoleMutation.isPending ||
                assignPermissionsMutation.isPending
              }
            >
              Create
            </Button>
            <Button
              type="button"
              className="bg-slate-100"
              onClick={() => {
                setOpenCreateModal(false);
                setNewRoleName("");
                setSelectedPermissionIds([]);
              }}
            >
              Cancel
            </Button>
          </div>
          {(createRoleMutation.isError ||
            assignPermissionsMutation.isError) && (
            <p className="text-sm text-red-600">
              {(assignPermissionsMutation.error as any)?.message ??
                (createRoleMutation.error as any)?.message ??
                "Failed to create role or assign permissions"}
            </p>
          )}
        </form>
      </Modal>

      {/* Roles Table */}
      {(rolesQuery.data?.length ?? 0) === 0 ? (
        <div
          className={
            isDarkMode
              ? "rounded-lg border border-slate-800 bg-slate-950 p-8 text-center"
              : "rounded-lg border border-slate-200 bg-slate-50 p-8 text-center"
          }
        >
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
            No roles found
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
                  Role Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Permissions
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rolesQuery.data?.map((role: any) => {
                const id = getRoleId(role);
                const name = getRoleName(role);
                return (
                  <tr
                    key={id ?? name}
                    className={
                      isDarkMode
                        ? "border-b border-slate-800 hover:bg-slate-800/60"
                        : "border-b border-slate-200 hover:bg-slate-50"
                    }
                  >
                    <td className="px-4 py-3 text-sm">{name}</td>
                    <td
                      className={
                        isDarkMode
                          ? "px-4 py-3 text-sm text-slate-300"
                          : "px-4 py-3 text-sm text-slate-600"
                      }
                    >
                      <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {getPermissionCount(role)} permissions
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className={
                            isDarkMode
                              ? "rounded-md bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                              : "rounded-md bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                          }
                          onClick={() => setViewingRole(role)}
                          title="View permissions"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(id)}
                          disabled={
                            deleteRoleMutation.isPending ||
                            adminRoleNames.includes((name ?? "").toUpperCase())
                          }
                          className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200 disabled:opacity-50"
                          title={
                            adminRoleNames.includes((name ?? "").toUpperCase())
                              ? "Cannot delete admin role"
                              : "Delete role"
                          }
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View Role Modal */}
      {viewingRole && (
        <Modal
          isOpen={!!viewingRole}
          onClose={() => setViewingRole(null)}
          title={`Permissions for ${viewingRole?.name ?? viewingRole?.id}`}
        >
          <div className="space-y-3">
            {(viewingRole.permissions ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">No permissions assigned</p>
            ) : (
              (viewingRole.permissions ?? []).map((p: any) => (
                <div key={p.id ?? p} className="text-sm">
                  {p.access ?? String(p)}
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
