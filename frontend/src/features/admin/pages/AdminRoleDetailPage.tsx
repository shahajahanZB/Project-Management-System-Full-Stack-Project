import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import {
  useAssignPermissionsToRoleMutation,
  useDeassignPermissionsFromRoleMutation,
  useGetAllRoles,
  useGetRoleWithPermissions,
  useGetUnassignedPermissionsByRole,
} from "@/features/auth/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type Context = { isDarkMode: boolean };

export default function AdminRoleDetailPage() {
  useDocumentTitle("Admin - Role Details");
  const { isDarkMode } = useOutletContext<Context>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { roleId } = useParams();
  const idNum = Number(roleId ?? "");
  const isValidId = Number.isInteger(idNum) && idNum > 0;

  const roleQuery = useGetRoleWithPermissions(idNum, isValidId);
  const unassignedQuery = useGetUnassignedPermissionsByRole(idNum, isValidId);
  const rolesQuery = useGetAllRoles(isValidId);
  const assignMutation = useAssignPermissionsToRoleMutation();
  const deassignMutation = useDeassignPermissionsFromRoleMutation();

  const assignedPerms = useMemo(
    () => roleQuery.data?.permissions ?? [],
    [roleQuery.data],
  );
  const availablePerms = useMemo(
    () => Object.values(unassignedQuery.data ?? {}).flat(),
    [unassignedQuery.data],
  );

  const matchedRole = rolesQuery.data?.find(
    (role: any) => (role.id ?? role.roleId) === idNum,
  ) as any;
  const roleName =
    matchedRole?.name ?? matchedRole?.roleName ?? roleQuery.data?.name ?? "";

  const isProtectedAdminRole = ["ADMIN", "SUPERADMIN"].includes(
    String(roleName).trim().toUpperCase(),
  );

  const initialAssignedIds = useMemo(
    () => new Set(assignedPerms.map((perm: any) => perm.id ?? perm)),
    [assignedPerms],
  );

  const [selectedAssignedIds, setSelectedAssignedIds] = useState<Set<number>>(
    new Set(initialAssignedIds),
  );
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    setSelectedAssignedIds(new Set(initialAssignedIds));
    setSelectedAvailableIds(new Set());
  }, [initialAssignedIds]);

  const hasChanges =
    Array.from(initialAssignedIds).some((id) => !selectedAssignedIds.has(id)) ||
    selectedAvailableIds.size > 0;

  const toggleAssigned = (permissionId: number) => {
    if (isProtectedAdminRole) return;
    const next = new Set(selectedAssignedIds);
    if (next.has(permissionId)) {
      next.delete(permissionId);
    } else {
      next.add(permissionId);
    }
    setSelectedAssignedIds(next);
  };

  const toggleAvailable = (permissionId: number) => {
    if (isProtectedAdminRole) return;
    const next = new Set(selectedAvailableIds);
    if (next.has(permissionId)) {
      next.delete(permissionId);
    } else {
      next.add(permissionId);
    }
    setSelectedAvailableIds(next);
  };

  const handleSave = async () => {
    if (!isValidId) return;
    if (isProtectedAdminRole) return;

    const toAssign = Array.from(selectedAvailableIds);
    const toDeassign = Array.from(initialAssignedIds).filter(
      (id) => !selectedAssignedIds.has(id),
    );

    try {
      if (toAssign.length > 0) {
        await assignMutation.mutateAsync({
          roleId: idNum,
          payload: { permissionIds: toAssign },
        });
      }

      if (toDeassign.length > 0) {
        await deassignMutation.mutateAsync({
          roleId: idNum,
          payload: { permissionIds: toDeassign },
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      await queryClient.invalidateQueries({
        queryKey: ["role", idNum, "permissions"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["role", idNum, "unassigned-permissions"],
      });
      alert("Permissions updated successfully");
    } catch (err) {
      console.error("Save error:", err);
      alert((err as any)?.message ?? "Failed to update permissions");
    }
  };

  if (!isValidId) {
    return (
      <div
        className={`py-8 text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
      >
        Invalid role id
      </div>
    );
  }

  if (
    roleQuery.isLoading ||
    unassignedQuery.isLoading ||
    rolesQuery.isLoading
  ) {
    return (
      <div
        className={`py-8 text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
      >
        Loading...
      </div>
    );
  }

  if (roleQuery.isError || unassignedQuery.isError || rolesQuery.isError) {
    const roleErrMsg =
      (roleQuery.error as any)?.message ||
      (roleQuery.error as any)?.response?.data ||
      String(roleQuery.error);
    const unassignedErrMsg =
      (unassignedQuery.error as any)?.message ||
      (unassignedQuery.error as any)?.response?.data ||
      String(unassignedQuery.error);
    const rolesErrMsg =
      (rolesQuery.error as any)?.message ||
      (rolesQuery.error as any)?.response?.data ||
      String(rolesQuery.error);

    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading role</h3>
            <p className="text-sm text-red-700">Unable to fetch role details</p>
            <div className="mt-2 text-xs text-red-700">
              {roleQuery.isError && (
                <div>
                  <strong>Role error:</strong> {String(roleErrMsg)}
                </div>
              )}
              {unassignedQuery.isError && (
                <div>
                  <strong>Available permissions error:</strong>{" "}
                  {String(unassignedErrMsg)}
                </div>
              )}
              {rolesQuery.isError && (
                <div>
                  <strong>Roles error:</strong> {String(rolesErrMsg)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          onClick={() => navigate("/admin/roles")}
          className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="size-4" />
          Back to Roles
        </Button>
      </div>

      <div>
        <h1
          className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Role: {roleName || roleId}
        </h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
          Toggle assigned permissions on the left and add new ones on the right.
        </p>
        {isProtectedAdminRole && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Admin roles are read-only. Permission changes are disabled for this
            role.
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className={`rounded-lg border p-6 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
        >
          <h2
            className={`mb-4 text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
          >
            Assigned Permissions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={
                    isDarkMode
                      ? "border-b border-slate-700"
                      : "border-b border-slate-200"
                  }
                >
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Permission
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Keep
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignedPerms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-center text-sm text-slate-500"
                    >
                      No permissions assigned
                    </td>
                  </tr>
                ) : (
                  assignedPerms.map((perm: any) => {
                    const permissionId = perm.id ?? perm;
                    const isKept = selectedAssignedIds.has(permissionId);
                    return (
                      <tr
                        key={String(permissionId)}
                        className={
                          isDarkMode
                            ? "border-b border-slate-800 hover:bg-slate-800/50"
                            : "border-b border-slate-200 hover:bg-slate-50"
                        }
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {perm.access ?? String(permissionId)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs ${isDarkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}`}
                          >
                            {perm.category ?? "OTHER"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isKept}
                            disabled={isProtectedAdminRole}
                            onChange={() => toggleAssigned(permissionId)}
                            className="h-4 w-4 cursor-pointer rounded border disabled:cursor-not-allowed"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className={`rounded-lg border p-6 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
        >
          <h2
            className={`mb-4 text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
          >
            Available Permissions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={
                    isDarkMode
                      ? "border-b border-slate-700"
                      : "border-b border-slate-200"
                  }
                >
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Permission
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Add
                  </th>
                </tr>
              </thead>
              <tbody>
                {availablePerms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-center text-sm text-slate-500"
                    >
                      No additional permissions available
                    </td>
                  </tr>
                ) : (
                  availablePerms.map((perm: any) => {
                    const permissionId = perm.id ?? perm;
                    const isSelected = selectedAvailableIds.has(permissionId);
                    return (
                      <tr
                        key={String(permissionId)}
                        className={
                          isDarkMode
                            ? "border-b border-slate-800 hover:bg-slate-800/50"
                            : "border-b border-slate-200 hover:bg-slate-50"
                        }
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {perm.access ?? String(permissionId)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs ${isDarkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}`}
                          >
                            {perm.category ?? "OTHER"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isProtectedAdminRole}
                            onChange={() => toggleAvailable(permissionId)}
                            className="h-4 w-4 cursor-pointer rounded border disabled:cursor-not-allowed"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={
            isProtectedAdminRole ||
            assignMutation.isPending ||
            deassignMutation.isPending ||
            !hasChanges
          }
          className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isProtectedAdminRole
            ? "Read Only"
            : assignMutation.isPending || deassignMutation.isPending
              ? "Saving..."
              : "Save Changes"}
        </Button>
        <Button
          onClick={() => navigate("/admin/roles")}
          className="bg-slate-100 hover:bg-slate-200"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
