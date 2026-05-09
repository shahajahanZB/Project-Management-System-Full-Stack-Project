import { apiClient } from "@/lib/api-client";
import type {
  AssignPermissionsPayload,
  AssignRolesPayload,
  AuthSession,
  CreatePermissionsPayload,
  CreateRolePayload,
  DeassignPermissionsPayload,
  DeassignRolesPayload,
  ForgotPasswordPayload,
  LoginCredentials,
  PermissionsGrouped,
  Permission,
  ResetPasswordPayload,
  Role,
  SignUpPayload,
  User,
  UserProfile,
  UserProfileUpdatePayload,
} from "./types";

// ============================================================================
// AUTH APIs
// ============================================================================

export async function login(credentials: LoginCredentials) {
  const response = await apiClient.post<AuthSession>(
    "/v1/iam/login",
    credentials,
  );
  return response.data;
}

export async function signUp(payload: SignUpPayload) {
  const response = await apiClient.post<AuthSession>(
    "/v1/iam/register",
    payload,
  );
  return response.data;
}

export async function requestPasswordResetOTP(payload: ForgotPasswordPayload) {
  const response = await apiClient.post<{ message: string }>(
    "/v1/iam/forgot-password/request-otp",
    payload,
  );
  return response.data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await apiClient.post<{ message: string }>(
    "/v1/iam/forgot-password/reset",
    payload,
  );
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get<User>("/v1/iam/me");
  return response.data;
}

// ============================================================================
// USER APIs
// ============================================================================

export async function getAllUsers() {
  const response = await apiClient.get<User[]>("/v1/iam/users");
  return response.data;
}

export async function getUserProfile(userId: number) {
  const response = await apiClient.get<UserProfile>(
    `/v1/iam/users/${userId}/profile`,
  );
  return response.data;
}

export async function updateUserProfile(
  userId: number,
  payload: UserProfileUpdatePayload,
) {
  const response = await apiClient.patch<UserProfile>(
    `/v1/iam/users/${userId}/profile`,
    payload,
  );
  return response.data;
}

export async function getUsersWithNoRoles() {
  const response = await apiClient.get<User[]>("/v1/iam/users/no-roles");
  return response.data;
}

export async function getUsersByRole(role: string) {
  const response = await apiClient.get<User[]>("/v1/iam", {
    params: { role },
  });
  return response.data;
}

export async function assignRolesToUsers(payload: AssignRolesPayload) {
  const response = await apiClient.post<{ message: string }>(
    "/v1/iam/assign-roles",
    payload,
  );
  return response.data;
}

export async function deassignRolesFromUsers(payload: DeassignRolesPayload) {
  const response = await apiClient.post<{ message: string }>(
    "/v1/iam/deassign",
    payload,
  );
  return response.data;
}

export async function deleteUser(userId: number) {
  const response = await apiClient.delete<{ message: string }>(
    `/v1/iam/users/${userId}`,
  );
  return response.data;
}

export async function updateUser(
  userId: number,
  payload: { username?: string; email?: string; roleIds?: number[] },
) {
  const response = await apiClient.put<User>(
    `/v1/iam/users/${userId}`,
    payload,
  );
  return response.data;
}

// ============================================================================
// ROLE APIs
// ============================================================================

export async function createRole(payload: CreateRolePayload) {
  const response = await apiClient.post<any>("/v1/iam/roles/create", payload);
  return normalizeRole(response.data);
}

export async function getAllRoles() {
  const response = await apiClient.get<any[]>("/v1/iam/roles");
  return response.data.map(normalizeRole);
}

export async function deleteRole(roleId: number) {
  const response = await apiClient.delete<{ message: string }>(
    `/v1/iam/roles/${roleId}`,
  );
  return response.data;
}

export async function getRoleWithPermissions(roleId: number) {
  const response = await apiClient.get<any>(
    `/v1/iam/roles/${roleId}/assigned-permissions`,
  );
  const data = response.data;
  if (Array.isArray(data)) {
    return {
      id: roleId,
      name: String(roleId),
      permissions: data,
    } as Role;
  }
  return normalizeRole(data);
}

export async function getUnassignedPermissionsByRole(roleId: number) {
  const response = await apiClient.get<PermissionsGrouped>(
    `/v1/iam/roles/${roleId}/unassigned-permissions`,
  );
  return response.data;
}

export async function assignPermissionsToRole(
  roleId: number,
  payload: AssignPermissionsPayload,
) {
  const response = await apiClient.post<{ message: string }>(
    "/v1/iam/roles/assign-permissions",
    payload,
    {
      params: { roleId },
    },
  );
  return response.data;
}

export async function deassignPermissionsFromRole(
  roleId: number,
  payload: DeassignPermissionsPayload,
) {
  const response = await apiClient.delete<{ message: string }>(
    "/v1/iam/roles/deassign-permissions",
    {
      params: { roleId },
      data: payload,
    },
  );
  return response.data;
}

export async function getAllPermissions() {
  const response = await apiClient.get<PermissionsGrouped>(
    "/v1/iam/roles/get-all-permissions",
  );
  return response.data;
}

// ============================================================================
// PERMISSION APIs
// ============================================================================

export async function createPermissionsBulk(payload: CreatePermissionsPayload) {
  const response = await apiClient.post<{ message: string }>(
    "/v1/iam/permissions/bulk",
    payload,
  );
  return response.data;
}

function normalizeRole(role: any): Role {
  return {
    ...role,
    id: role?.id ?? role?.roleId,
    name: role?.name ?? role?.roleName,
    permissions: role?.permissions ?? [],
  };
}
