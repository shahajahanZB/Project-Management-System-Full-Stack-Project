import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  FolderKanban,
  Layers3,
  LogOut,
  Plus,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGetCurrentUser } from "@/features/auth/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useProjects } from "@/features/projects/hooks";
import type { Project, ProjectStatus } from "@/features/projects/types";

type ModuleTile = {
  label: string;
  perm: string;
  icon: typeof FolderKanban;
  description: string;
};

type ProjectCard = {
  id: string;
  name: string;
  key: string;
  status: string;
  summary: string;
  updated: string;
  color: string;
};

const statusLabel: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

function formatRelativeDate(value?: string) {
  if (!value) return "Recently updated";

  const updatedAt = new Date(value);
  if (Number.isNaN(updatedAt.getTime())) return "Recently updated";

  const diffMs = updatedAt.getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffHours) < 24) {
    if (diffHours === 0) return "Updated just now";
    return diffHours > 0
      ? `Updated in ${diffHours}h`
      : `Updated ${Math.abs(diffHours)}h ago`;
  }

  if (Math.abs(diffDays) < 7) {
    return diffDays > 0
      ? `Updated in ${diffDays}d`
      : `Updated ${Math.abs(diffDays)}d ago`;
  }

  return updatedAt.toLocaleDateString();
}

function projectColorByIndex(index: number) {
  const palettes = [
    "from-indigo-500 to-cyan-400",
    "from-emerald-500 to-teal-400",
    "from-amber-500 to-orange-400",
    "from-fuchsia-500 to-pink-400",
  ];

  return palettes[index % palettes.length];
}

export function UserDashboardPage() {
  useDocumentTitle("Dashboard");

  const navigate = useNavigate();
  const currentUserQuery = useGetCurrentUser();
  const projectsQuery = useProjects();
  const roles = currentUserQuery.data?.roles ?? [];
  const permissions: string[] = currentUserQuery.data?.permissions ?? [];
  const isAdmin = roles.some((role: any) =>
    ["ADMIN", "SUPERADMIN"].includes(role?.name ?? role),
  );
  const hasPermission = (perm: string) => isAdmin || permissions.includes(perm);

  const projectCards: ProjectCard[] = (projectsQuery.data ?? []).map(
    (project: Project, index) => ({
      id: project.id,
      name: project.name,
      key: project.key,
      status: statusLabel[project.status],
      summary: project.description ?? "No description yet.",
      updated: formatRelativeDate(project.updatedAt),
      color: projectColorByIndex(index),
    }),
  );

  const modules: ModuleTile[] = [
    {
      label: "Projects",
      perm: "PROJECT_VIEW",
      icon: FolderKanban,
      description: "View project boards and delivery status.",
    },
    {
      label: "Create project",
      perm: "PROJECT_CREATE",
      icon: Plus,
      description: "Start a new project workspace.",
    },
    {
      label: "Epics",
      perm: "EPIC_VIEW",
      icon: Layers3,
      description: "Group work into delivery milestones.",
    },
    {
      label: "Team access",
      perm: "ROLE_MANAGE",
      icon: Users,
      description: "Manage roles and permissions.",
    },
  ].filter((module) => hasPermission(module.perm));

  const quickActions = [
    {
      label: "View projects",
      perm: "PROJECT_VIEW",
      to: "/projects",
      icon: FolderKanban,
    },
    {
      label: "Create project",
      perm: "PROJECT_CREATE",
      to: "/projects/new",
      icon: Plus,
    },
    {
      label: "Manage roles",
      perm: "ROLE_MANAGE",
      to: "/admin/roles",
      icon: ShieldCheck,
    },
  ].filter((action) => hasPermission(action.perm));

  const stats = [
    {
      label: "Projects",
      value: String(projectCards.length),
      icon: FolderKanban,
      tone: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Members",
      value: "24",
      icon: Users,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Open stories",
      value: "18",
      icon: Clock,
      tone: "bg-amber-100 text-amber-700",
    },
    {
      label: "Permissions",
      value: permissions.length.toString(),
      icon: ShieldCheck,
      tone: "bg-slate-100 text-slate-700",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

  if (currentUserQuery.isLoading) {
    return (
      <div className="min-h-[calc(100vh-3rem)] rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_38%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center rounded-[2rem] border border-slate-200 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Loading workspace...
          </div>
        </div>
      </div>
    );
  }

  const currentUser = currentUserQuery.data;

  return (
    <div className="min-h-[calc(100vh-3rem)] rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_38%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_0.9fr] lg:p-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-200">
                    <Rocket className="size-7" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                      Workspace home
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                      Welcome
                      {currentUser?.username ? `, ${currentUser.username}` : ""}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                      This is your root dashboard. Start a project, jump into an
                      existing board, or move directly to the modules you can
                      access.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Logout
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">{stat.label}</p>
                          <p className="mt-1 text-2xl font-semibold text-slate-950">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`rounded-2xl px-3 py-3 ${stat.tone}`}>
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                Access granted
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                  <span className="text-sm text-slate-300">Roles</span>
                  <span className="font-medium">
                    {roles.length > 0
                      ? roles.map((role: any) => role.name ?? role).join(", ")
                      : "No role"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                  <span className="text-sm text-slate-300">Permissions</span>
                  <span className="font-medium">{permissions.length}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {modules.slice(0, 4).map((module) => {
                  const Icon = module.icon;
                  return (
                    <span
                      key={module.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-medium text-slate-200"
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {module.label}
                    </span>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.to)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block font-medium text-white">
                            {action.label}
                          </span>
                          <span className="block text-xs text-slate-400">
                            Open the matching workspace area
                          </span>
                        </span>
                      </span>
                      <ChevronRight
                        className="size-4 text-slate-400"
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {currentUser ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-400">
                    Projects
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Your project cards
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {hasPermission("PROJECT_CREATE") ? (
                    <Button
                      onClick={() => navigate("/projects/new")}
                      className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Create project
                    </Button>
                  ) : null}
                  {hasPermission("PROJECT_VIEW") ? (
                    <Button
                      onClick={() => navigate("/projects")}
                      className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                    >
                      View projects
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projectsQuery.isLoading ? (
                  <div className="col-span-full rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                    Loading your projects...
                  </div>
                ) : projectsQuery.isError ? (
                  <div className="col-span-full rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
                    Projects could not be loaded right now.
                  </div>
                ) : projectCards.length === 0 ? (
                  <div className="col-span-full rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                    No projects yet. Create your first project to see it here.
                  </div>
                ) : (
                  projectCards.map((project, index) => (
                    <div
                      key={project.key}
                      className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div
                        className={`h-2 bg-gradient-to-r ${projectColorByIndex(index)}`}
                      />
                      <div className="space-y-5 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-950">
                                {project.name}
                              </h3>
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                                {project.key}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {project.summary}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                              Status
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {project.status}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <Users className="size-4" aria-hidden="true" />
                            Open project details
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Calendar className="size-4" aria-hidden="true" />
                            {project.updated}
                          </span>
                        </div>

                        <Button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                        >
                          Open project
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
                    Quick start
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">
                    Jump into the workspace modules you can access
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This dashboard is now the app root, so users land here
                    immediately after sign in and can branch into project work
                    from one place.
                  </p>
                </div>

                <div className="space-y-3">
                  {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <div
                        key={module.label}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                          <Icon className="size-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-950">
                            {module.label}
                          </p>
                          <p className="text-sm text-slate-500">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {hasPermission("USER_UPDATE") ? (
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
                    People
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">
                    User access and team control
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Manage team access, user updates, and project membership
                    from the admin area.
                  </p>
                  <Button
                    onClick={() => navigate("/users")}
                    className="mt-4 rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  >
                    Open users
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
                  Profile
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Username</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {currentUser.username}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {currentUser.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Roles</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {currentUser.roles && currentUser.roles.length > 0 ? (
                        currentUser.roles.map((role: any) => (
                          <span
                            key={role.id ?? role.name}
                            className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                          >
                            {role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">
                          No roles assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
