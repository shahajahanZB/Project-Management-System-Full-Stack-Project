import { useOutletContext, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useGetAllRoles,
  useGetAllUsers,
  useAssignRolesToUsersMutation,
  useDeassignRolesFromUsersMutation,
} from "@/features/auth/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { User, Role } from "@/features/auth/types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type Context = { isDarkMode: boolean };

export default function AdminRoleMembersPage() {
  useDocumentTitle("Admin - Manage Role Members");
  const { isDarkMode } = useOutletContext<Context>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const rolesQuery = useGetAllRoles();
  const usersQuery = useGetAllUsers();
  const assignRoleMutation = useAssignRolesToUsersMutation();
  const deassignRoleMutation = useDeassignRolesFromUsersMutation();

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedAssignedUserIds, setSelectedAssignedUserIds] = useState<
    Set<number>
  >(new Set());
  const [selectedAvailableUserIds, setSelectedAvailableUserIds] = useState<
    Set<number>
  >(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const selectedRole = rolesQuery.data?.find(
    (r: any) => (r.id ?? r.roleId) === selectedRoleId,
  ) as any;
  const selectedRoleName = selectedRole?.name ?? selectedRole?.roleName ?? "";
  const isProtectedAdminRole = ["ADMIN", "SUPERADMIN"].includes(
    String(selectedRoleName).trim().toUpperCase(),
  );

  const isAdminUser = (user: any) =>
    user.roles?.some((role: any) =>
      ["ADMIN", "SUPERADMIN"].includes(
        String(role?.name ?? role?.roleName ?? "")
          .trim()
          .toUpperCase(),
      ),
    );

  const usersInRole =
    usersQuery.data?.filter((u) =>
      u.roles?.some((r: any) => (r.id ?? r.roleId) === selectedRoleId),
    ) ?? [];
  const usersNotInRole =
    usersQuery.data?.filter(
      (u) =>
        !isAdminUser(u) &&
        !u.roles?.some((r: any) => (r.id ?? r.roleId) === selectedRoleId),
    ) ?? [];

  const initialAssignedUserIds = new Set(usersInRole.map((u) => u.id));

  useEffect(() => {
    setSelectedAssignedUserIds(new Set(initialAssignedUserIds));
    setSelectedAvailableUserIds(new Set());
  }, [selectedRoleId]);

  const handleToggleAssignedUser = (userId: number) => {
    if (isProtectedAdminRole) return;
    const next = new Set(selectedAssignedUserIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedAssignedUserIds(next);
  };

  const handleToggleAvailableUser = (userId: number) => {
    if (isProtectedAdminRole) return;
    const next = new Set(selectedAvailableUserIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedAvailableUserIds(next);
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    if (isProtectedAdminRole) return;

    setIsLoading(true);
    try {
      const userIdsToAssign = Array.from(selectedAvailableUserIds);
      const userIdsToDeassign = Array.from(initialAssignedUserIds).filter(
        (userId) => !selectedAssignedUserIds.has(userId),
      );

      if (userIdsToAssign.length > 0) {
        await assignRoleMutation.mutateAsync({
          userIds: userIdsToAssign,
          roleId: selectedRoleId,
        });
      }

      if (userIdsToDeassign.length > 0) {
        await deassignRoleMutation.mutateAsync({
          userIds: userIdsToDeassign,
          roleId: selectedRoleId,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedAssignedUserIds(new Set(initialAssignedUserIds));
      setSelectedAvailableUserIds(new Set());
      alert("Role assignments updated successfully");
    } catch (err) {
      alert((err as any)?.message ?? "Failed to update role assignments");
    } finally {
      setIsLoading(false);
    }
  };

  if (rolesQuery.isLoading || usersQuery.isLoading) {
    return (
      <div
        className={`py-8 text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
      >
        Loading...
      </div>
    );
  }

  if (rolesQuery.isError || usersQuery.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading data</h3>
            <p className="text-sm text-red-700">
              Unable to fetch roles or users
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button
          onClick={() => navigate("/admin/roles")}
          className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="size-4" />
          Back to Roles
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1
          className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Manage Role Members
        </h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
          Select a role and choose which users should be assigned to it
        </p>
      </div>

      {/* Role Selection */}
      <div
        className={`rounded-lg border p-6 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
      >
        <label className="block text-sm font-medium text-slate-700">
          Select Role
        </label>
        <select
          value={selectedRoleId ?? ""}
          onChange={(e) => {
            const roleId = e.target.value ? Number(e.target.value) : null;
            setSelectedRoleId(roleId);
          }}
          className="mt-2 w-full rounded-md border px-3 py-2"
        >
          <option value="">-- Choose a role --</option>
          {rolesQuery.data?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      {selectedRoleId ? (
        <div className="space-y-6">
          <div
            className={`mb-4 rounded-md ${isDarkMode ? "bg-blue-900 text-blue-100" : "bg-blue-50 text-blue-900"} p-3 text-sm`}
          >
            {usersInRole.length} of {usersQuery.data?.length ?? 0} users are
            assigned to{" "}
            <strong>{selectedRoleName || selectedRole?.name}</strong>
            {isProtectedAdminRole && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                Read only
              </span>
            )}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div
              className={`rounded-lg border p-6 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
            >
              <h2
                className={`mb-4 text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
              >
                Assigned Users
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
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">
                        Keep
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersInRole.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-center text-sm text-slate-500"
                        >
                          No users assigned
                        </td>
                      </tr>
                    ) : (
                      usersInRole.map((user) => {
                        const isKept = selectedAssignedUserIds.has(user.id);
                        return (
                          <tr
                            key={user.id}
                            className={
                              isDarkMode
                                ? "border-b border-slate-800 hover:bg-slate-800/60"
                                : "border-b border-slate-200 hover:bg-slate-50"
                            }
                          >
                            <td className="px-4 py-3 text-sm">
                              {user.username}
                            </td>
                            <td className="px-4 py-3 text-sm">{user.email}</td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isKept}
                                disabled={isProtectedAdminRole}
                                onChange={() =>
                                  handleToggleAssignedUser(user.id)
                                }
                                className="rounded border disabled:cursor-not-allowed"
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
                Available Users
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
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">
                        Add
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersNotInRole.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-center text-sm text-slate-500"
                        >
                          No users available
                        </td>
                      </tr>
                    ) : (
                      usersNotInRole.map((user) => {
                        const isSelected = selectedAvailableUserIds.has(
                          user.id,
                        );
                        return (
                          <tr
                            key={user.id}
                            className={
                              isDarkMode
                                ? "border-b border-slate-800 hover:bg-slate-800/60"
                                : "border-b border-slate-200 hover:bg-slate-50"
                            }
                          >
                            <td className="px-4 py-3 text-sm">
                              {user.username}
                            </td>
                            <td className="px-4 py-3 text-sm">{user.email}</td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isProtectedAdminRole}
                                onChange={() =>
                                  handleToggleAvailableUser(user.id)
                                }
                                className="rounded border disabled:cursor-not-allowed"
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
        </div>
      ) : (
        <div
          className={
            isDarkMode
              ? "rounded-lg border border-slate-800 bg-slate-950 p-8 text-center"
              : "rounded-lg border border-slate-200 bg-slate-50 p-8 text-center"
          }
        >
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
            Select a role to manage its members
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {selectedRoleId && (
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleSave}
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={isLoading || isProtectedAdminRole}
          >
            {isProtectedAdminRole
              ? "Read Only"
              : isLoading
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
      )}
    </div>
  );
}
