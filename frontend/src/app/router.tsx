import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useParams,
} from "react-router-dom";
import { AppLayout } from "@/components/shared/AppLayout";
import RequireAdmin from "@/components/RequireAdmin";
import RequireAuth from "@/components/RequireAuth";
import RequirePermission from "@/components/RequirePermission";
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
import { useGetCurrentUser } from "@/features/auth/hooks";
import { EpicsPage, EpicDetailPage } from "@/features/epics";
import {
  IssueCreatePage,
  IssueDetailPage,
  IssueListPage,
} from "@/features/issue/pages";
import { ProjectKanbanPage } from "@/features/projects/pages/ProjectKanbanPage";
import { UserStoryDetailPage } from "@/features/kanban/pages/UserStoryDetailPage";
import { UserDashboardPage } from "@/features/dashboard/pages/UserDashboardPage";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { ProjectsCreatePage } from "@/features/projects/pages/ProjectsCreatePage";
import { ProjectsDetailPage } from "@/features/projects/pages/ProjectsDetailPage";
import { ProjectTeamPage } from "@/features/team/pages";
import { TasksPage } from "@/features/tasks/pages/TasksPage";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function ProjectDetailLayout() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) return <Navigate to="/dashboard" replace />;

  return (
    <ProjectProvider projectId={projectId}>
      <Outlet />
    </ProjectProvider>
  );
}

function isAdminRole(role: unknown) {
  const name =
    typeof role === "string" ? role : (role as { name?: string })?.name;
  return ["ADMIN", "ROLE_ADMIN", "SUPERADMIN", "ROLE_SUPERADMIN"].includes(
    name ?? "",
  );
}

function HomeRedirect() {
  const userQuery = useGetCurrentUser();
  const roles = userQuery.data?.roles ?? [];

  if (userQuery.isLoading) return null;

  return roles.some(isAdminRole) ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/dashboard" replace />
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
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            index: true,
            element: <HomeRedirect />,
          },
          {
            path: "dashboard",
            element: <UserDashboardPage />,
          },
          // {
          //   path: "projects",
          //   element: (
          //     <RequirePermission perm="PROJECT_VIEW">
          //       <ProjectsPage />
          //     </RequirePermission>
          //   ),
          // },
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
                path: "stories/:storyId",
                element: (
                  <RequirePermission perm="STORY_VIEW">
                    <UserStoryDetailPage />
                  </RequirePermission>
                ),
              },
              {
                path: "issues",
                element: (
                  <RequirePermission perm="STORY_VIEW">
                    <IssueListPage />
                  </RequirePermission>
                ),
              },
              {
                path: "issues/new",
                element: (
                  <RequirePermission perm="STORY_VIEW">
                    <IssueCreatePage />
                  </RequirePermission>
                ),
              },
              {
                path: "issues/:issueId",
                element: (
                  <RequirePermission perm="STORY_VIEW">
                    <IssueDetailPage />
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
            path: "profile",
            element: <UsersPage />, // current user profile page
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
            path: "issues",
            element: <Navigate to="/projects" replace />,
          },
          {
            path: "issues/*",
            element: <Navigate to="/projects" replace />,
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
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
