import { useMutation, useQuery } from "@tanstack/react-query";
import {
  assignPermissionsToRole,
  assignRolesToUsers,
  createPermissionsBulk,
  createRole,
  deassignPermissionsFromRole,
  deassignRolesFromUsers,
  deleteRole,
  deleteUser,
  getAllPermissions,
  getAllRoles,
  getAllUsers,
  getCurrentUser,
  getRoleWithPermissions,
  getUnassignedPermissionsByRole,
  getUsersByRole,
  getUsersWithNoRoles,
  getUserProfile,
  login,
  requestPasswordResetOTP,
  resetPassword,
  signUp,
  updateUser,
  updateUserProfile,
} from "./api";
import type { UserProfileUpdatePayload } from "./types";

// ============================================================================
// AUTH Hooks
// ============================================================================

export function useLoginMutation() {
  return useMutation({ mutationFn: login });
}

export function useSignUpMutation() {
  return useMutation({ mutationFn: signUp });
}

export function useRequestPasswordResetOTPMutation() {
  return useMutation({ mutationFn: requestPasswordResetOTP });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: resetPassword });
}

export function useGetCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    enabled,
  });
}

// ============================================================================
// USER Hooks
// ============================================================================

export function useGetAllUsers(enabled = true) {
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled,
  });
}

export function useGetUsersWithNoRoles(enabled = true) {
  return useQuery({
    queryKey: ["users-no-roles"],
    queryFn: getUsersWithNoRoles,
    enabled,
  });
}

export function useGetUserProfile(userId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfile(userId as number),
    enabled: enabled && typeof userId === "number",
  });
}

export function useUpdateUserProfileMutation() {
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: UserProfileUpdatePayload;
    }) => updateUserProfile(userId, payload),
  });
}

export function useGetUsersByRole(role: string, enabled = true) {
  return useQuery({
    queryKey: ["users-by-role", role],
    queryFn: () => getUsersByRole(role),
    enabled,
  });
}

export function useAssignRolesToUsersMutation() {
  return useMutation({ mutationFn: assignRolesToUsers });
}

export function useDeassignRolesFromUsersMutation() {
  return useMutation({ mutationFn: deassignRolesFromUsers });
}

export function useDeleteUserMutation() {
  return useMutation({ mutationFn: deleteUser });
}

// ============================================================================
// ROLE Hooks
// ============================================================================

export function useCreateRoleMutation() {
  return useMutation({ mutationFn: createRole });
}

export function useDeleteRoleMutation() {
  return useMutation({ mutationFn: deleteRole });
}

export function useGetAllRoles(enabled = true) {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
    enabled,
  });
}

export function useGetRoleWithPermissions(roleId: number, enabled = true) {
  return useQuery({
    queryKey: ["role", roleId, "permissions"],
    queryFn: () => getRoleWithPermissions(roleId),
    enabled,
  });
}

export function useGetUnassignedPermissionsByRole(
  roleId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ["role", roleId, "unassigned-permissions"],
    queryFn: () => getUnassignedPermissionsByRole(roleId),
    enabled,
  });
}

export function useAssignPermissionsToRoleMutation() {
  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: Parameters<typeof assignPermissionsToRole> extends [infer A, infer B]
      ? { roleId: A; payload: B }
      : never) => assignPermissionsToRole(roleId, payload),
  });
}

export function useDeassignPermissionsFromRoleMutation() {
  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: Parameters<typeof deassignPermissionsFromRole> extends [infer A, infer B]
      ? { roleId: A; payload: B }
      : never) => deassignPermissionsFromRole(roleId, payload),
  });
}

export function useGetAllPermissions(enabled = true) {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: getAllPermissions,
    enabled,
  });
}

export function useUpdateUserMutation() {
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: { username?: string; email?: string; roleIds?: number[] };
    }) => updateUser(userId, payload),
  });
}

// ============================================================================
// PERMISSION Hooks
// ============================================================================

export function useCreatePermissionsBulkMutation() {
  return useMutation({ mutationFn: createPermissionsBulk });
}

export function useHasPermission(permission: string) {
  const { data: user } = useGetCurrentUser();
  if (!user) return false;
  
  // Check if user has the permission directly or via roles
  const permissions = user.permissions ?? [];
  return permissions.includes(permission);
}
