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
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);

  const selectedRole = rolesQuery.data?.find((r) => r.id === selectedRoleId);
  const usersInRole =
    usersQuery.data?.filter((u) =>
      u.roles?.some((r) => r.id === selectedRoleId),
    ) ?? [];

  const handleToggleUser = (userId: number) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;

    setIsLoading(true);
    try {
      const userIdsToAssign = Array.from(selectedUserIds).filter(
        (userId) => !usersInRole.find((u) => u.id === userId),
      );
      const userIdsToDeassign = usersInRole
        .map((u) => u.id)
        .filter((userId) => !selectedUserIds.has(userId));

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
      setSelectedUserIds(new Set());
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
            setSelectedUserIds(
              new Set(
                usersQuery.data
                  ?.filter((u) => u.roles?.some((r) => r.id === roleId))
                  .map((u) => u.id) ?? [],
              ),
            );
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
        <div className="overflow-x-auto">
          <div
            className={`mb-4 rounded-md ${isDarkMode ? "bg-blue-900 text-blue-100" : "bg-blue-50 text-blue-900"} p-3 text-sm`}
          >
            {usersInRole.length} of {usersQuery.data?.length ?? 0} users are
            assigned to <strong>{selectedRole?.name}</strong>
          </div>
          <table className="w-full">
            <thead>
              <tr
                className={
                  isDarkMode
                    ? "border-b border-slate-800"
                    : "border-b border-slate-200"
                }
              >
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      usersQuery.data
                        ? selectedUserIds.size === usersQuery.data.length
                        : false
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds(
                          new Set(usersQuery.data?.map((u) => u.id) ?? []),
                        );
                      } else {
                        setSelectedUserIds(new Set());
                      }
                    }}
                    className="rounded border"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data?.map((user) => {
                const isInRole = usersInRole.some((u) => u.id === user.id);
                const isSelected = selectedUserIds.has(user.id);
                return (
                  <tr
                    key={user.id}
                    className={
                      isDarkMode
                        ? "border-b border-slate-800 hover:bg-slate-800/60"
                        : "border-b border-slate-200 hover:bg-slate-50"
                    }
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleUser(user.id)}
                        className="rounded border"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{user.username}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      {isSelected && !isInRole && (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Will enroll
                        </span>
                      )}
                      {!isSelected && isInRole && (
                        <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                          Will deroll
                        </span>
                      )}
                      {isSelected && isInRole && (
                        <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          Keep
                        </span>
                      )}
                      {!isSelected && !isInRole && (
                        <span
                          className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                        >
                          Not assigned
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            disabled={isLoading}
          >
            Save Changes
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
