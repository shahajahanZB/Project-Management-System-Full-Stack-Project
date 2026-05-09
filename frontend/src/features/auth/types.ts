// Auth Types
export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  username: string;
  email: string;
  password: string;
  roleIds?: number[];
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

export type AuthSession = {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
};

// User Types
export type UserProfile = {
  id?: number;
  fullName?: string;
  jobTitle?: string;
  department?: string;
  employeeCode?: string;
  location?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  githubUsername?: string;
  bio?: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  roles?: Role[];
  permissions?: string[];
  profile?: UserProfile;
};

export type UserProfileUpdatePayload = {
  fullName?: string;
  jobTitle?: string;
  department?: string;
  employeeCode?: string;
  location?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  githubUsername?: string;
  bio?: string;
};

export type AssignRolesPayload = {
  userIds: number[];
  roleId: number;
};

export type DeassignRolesPayload = {
  userIds: number[];
  roleId: number;
};

// Role Types
export type Role = {
  id: number;
  name: string;
  permissions?: Permission[];
};

export type CreateRolePayload = {
  name: string;
};

export type AssignPermissionsPayload = {
  permissionIds: number[];
};

export type DeassignPermissionsPayload = {
  permissionIds: number[];
};

// Permission Types
export type Permission = {
  id: number;
  access: string;
  category: "MODULE" | "DASHBOARD";
};

export type CreatePermissionsPayload = {
  permissions: Array<{
    access: string;
    category: "MODULE" | "DASHBOARD";
  }>;
};

export type PermissionsGrouped = {
  [category: string]: Permission[];
};
