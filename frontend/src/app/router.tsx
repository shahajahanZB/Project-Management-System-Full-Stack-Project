import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useParams,
} from "react-router-dom";
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
import RequirePermission from "@/components/RequirePermission";
import { UserDashboardPage } from "@/features/dashboard/pages";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { ProjectsCreatePage } from "@/features/projects/pages/ProjectsCreatePage";
import { ProjectsDetailPage } from "@/features/projects/pages/ProjectsDetailPage";
import { EpicsPage, EpicDetailPage } from "@/features/epics";
import { ProjectKanbanPage } from "@/features/projects/pages/ProjectKanbanPage";
import { ProjectIssuesPage } from "@/features/projects/pages/ProjectIssuesPage";
import { ProjectTeamPage } from "@/features/team/pages";
import { TasksPage } from "@/features/tasks/pages/TasksPage";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProjectProvider } from "@/contexts/ProjectContext";

function ProjectDetailLayout() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) return <Navigate to="/projects" replace />;

  return (
    <ProjectProvider projectId={projectId}>
      <Outlet />
    </ProjectProvider>
  );
}

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
        element: <Navigate to="/" replace />,
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "projects",
        element: (
          <RequirePermission perm="PROJECT_VIEW">
            <ProjectsPage />
          </RequirePermission>
        ),
      },
      {
        path: "projects/new",
        element: (
          <RequirePermission perm="PROJECT_CREATE">
            <ProjectsCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: "projects/:projectId",
        element: <ProjectDetailLayout />,
        children: [
          {
            index: true,
            element: (
              <RequirePermission perm="PROJECT_VIEW">
                <ProjectsDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: "epics",
            element: (
              <RequirePermission perm="EPIC_VIEW">
                <EpicsPage />
              </RequirePermission>
            ),
          },
          {
            path: "epics/:epicId",
            element: (
              <RequirePermission perm="EPIC_VIEW">
                <EpicDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: "kanban",
            element: (
              <RequirePermission perm="STORY_VIEW">
                <ProjectKanbanPage />
              </RequirePermission>
            ),
          },
          {
            path: "issues",
            element: (
              <RequirePermission perm="STORY_VIEW">
                <ProjectIssuesPage />
              </RequirePermission>
            ),
          },
          {
            path: "team",
            element: (
              <RequirePermission perm="PROJECT_MANAGE_MEMBERS">
                <ProjectTeamPage />
              </RequirePermission>
            ),
          },
        ],
      },
      {
        path: "tasks",
        element: (
          <RequirePermission perm="USER_STORY_VIEW">
            <TasksPage />
          </RequirePermission>
        ),
      },
      {
        path: "users",
        element: (
          <RequirePermission perm="USER_UPDATE">
            <UsersPage />
          </RequirePermission>
        ),
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
        element: <UserDashboardPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
