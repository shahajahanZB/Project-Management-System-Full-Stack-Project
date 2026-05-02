import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/shared/AppLayout";
import {
  ForgotPasswordPage,
  LoginPage,
  SignUpPage,
  VerifyOtpPage,
} from "@/features/auth/pages";
import {
  AdminDashboardPage,
  AdminHomePage,
  AdminUsersPage,
  AdminUserDetailPage,
  AdminRolesPermissionsPage,
  AdminRoleMembersPage,
  AdminRoleDetailPage,
} from "@/features/admin/pages";
import RequireAdmin from "@/components/RequireAdmin";
import { UserDashboardPage } from "@/features/dashboard/pages";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "sign-up",
        element: <SignUpPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "verify-otp",
        element: <VerifyOtpPage />,
      },
      {
        path: "dashboard",
        element: <UserDashboardPage />,
      },
      {
        path: "admin",
        element: (
          <RequireAdmin>
            <AdminDashboardPage />
          </RequireAdmin>
        ),
        children: [
          { index: true, element: <AdminHomePage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "users/:userId", element: <AdminUserDetailPage /> },
          { path: "roles", element: <AdminRolesPermissionsPage /> },
          { path: "roles/:roleId", element: <AdminRoleDetailPage /> },
          { path: "roles/members", element: <AdminRoleMembersPage /> },
        ],
      },
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
