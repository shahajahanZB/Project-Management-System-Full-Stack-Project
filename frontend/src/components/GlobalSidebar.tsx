import {
  Activity,
  CheckSquare,
  ChevronDown,
  FolderKanban,
  Home,
  Layers3,
  Loader2,
  LogOut,
  User,
  Users,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useGetCurrentUser, useGetUserProfile } from "@/features/auth/hooks";
import { useProject, useProjects } from "@/features/projects/hooks";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MenuItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  perm?: string;
  tag?: string;
};

function adminMenu(): MenuItem[] {
  return [
    { to: "/admin", label: "Home", icon: Home },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/roles", label: "Roles & Permissions", icon: User },
    { to: "/admin/roles/members", label: "Manage Members", icon: Users },
  ];
}

function userMenu(): MenuItem[] {
  return [
    {
      to: "/projects",
      label: "Projects",
      icon: FolderKanban,
      perm: "PROJECT_VIEW",
    },
  ];
}

function projectMenu(projectId: string): MenuItem[] {
  return [
    {
      to: `/projects/${projectId}`,
      label: "Overview",
      icon: FolderKanban,
      perm: "PROJECT_VIEW",
    },
    {
      to: `/projects/${projectId}/epics`,
      label: "Epics",
      icon: Layers3,
      perm: "EPIC_VIEW",
    },
    {
      to: `/projects/${projectId}/kanban`,
      label: "Kanban",
      icon: CheckSquare,
      perm: "STORY_VIEW",
    },
    {
      to: `/projects/${projectId}/issues`,
      label: "Issues",
      icon: Activity,
      perm: "STORY_VIEW",
    },
    {
      to: `/projects/${projectId}/team`,
      label: "Team",
      icon: Users2,
      perm: "PROJECT_MANAGE_MEMBERS",
      tag: "Team",
    },
  ];
}

export default function GlobalSidebar() {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const hasToken = Boolean(localStorage.getItem("authToken"));
  const userQuery: any = useGetCurrentUser(hasToken);
  const { projectId } = useParams<{ projectId: string }>();
  const projectQuery = useProject(projectId ? Number(projectId) : undefined);
  const projectsQuery = useProjects();
  const navigate = useNavigate();
  const expanded = true;

  if (!hasToken) return null;

  const roles = (userQuery.data?.roles as any[]) ?? [];
  const permissions: string[] = userQuery.data?.permissions ?? [];
  const profileQuery = useGetUserProfile(userQuery.data?.id);
  const avatarUrl = profileQuery.data?.avatarUrl ??
    (userQuery.data as any)?.profile?.avatarUrl;
  const isAdmin = roles.some((role: any) => {
    const name = typeof role === "string" ? role : role?.name;
    return ["ADMIN", "ROLE_ADMIN", "SUPERADMIN", "ROLE_SUPERADMIN"].includes(
      name,
    );
  });

  const hasPermission = (perm: string) => isAdmin || permissions.includes(perm);

  const items = projectId
    ? projectMenu(projectId).filter(
        (item) => !item.perm || hasPermission(item.perm),
      )
    : isAdmin
      ? adminMenu()
      : userMenu().filter((item) => !item.perm || hasPermission(item.perm));

  const getRoleLabel = () => {
    const roleList = roles.map((role: any) => role?.name ?? role);
    if (
      roleList.some((role) => ["SUPERADMIN", "ROLE_SUPERADMIN"].includes(role))
    ) {
      return "Superadmin";
    }
    if (roleList.some((role) => ["ADMIN", "ROLE_ADMIN"].includes(role))) {
      return "Admin";
    }
    return "Member";
  };

  const displayName =
    userQuery.data?.username ?? userQuery.data?.name ?? "User";
  const initials = String(displayName)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

  if (userQuery.isLoading) {
    return (
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">
        <div className="flex h-full items-center justify-center text-slate-500">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Loading navigation...
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-3 relative">
          <div
            className={cn(
              "flex items-center gap-3 w-full",
              !expanded && "mx-auto",
            )}
          >
            {expanded && projectId ? (
              <div className="flex-1 relative">
                <button
                  onClick={() =>
                    setIsProjectDropdownOpen(!isProjectDropdownOpen)
                  }
                  className="flex items-center gap-2 w-full rounded-lg px-2 py-1 hover:bg-slate-100 transition"
                >
                  <span className="text-sm font-semibold tracking-wide text-slate-900 truncate flex-1 text-left">
                    {projectQuery.isLoading
                      ? "..."
                      : projectQuery.data?.name || "Project"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-slate-600 flex-shrink-0 transition-transform",
                      isProjectDropdownOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                {isProjectDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 rounded-lg border bg-white shadow-lg z-50">
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setIsProjectDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b text-sm font-medium text-slate-700 transition"
                    >
                      ← Back to Dashboard
                    </button>
                    {projectsQuery.data && projectsQuery.data.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto">
                        {projectsQuery.data.map((project: any) => (
                          <button
                            key={project.id}
                            onClick={() => {
                              navigate(`/projects/${project.id}`);
                              setIsProjectDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 transition",
                              projectId === String(project.id) && "bg-slate-50",
                            )}
                          >
                            <div className="font-medium text-slate-950">
                              {project.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {project.key}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No projects available
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-sm font-semibold tracking-wide text-slate-900">
                {APP_NAME}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className={cn("flex-1 overflow-y-auto p-3", !expanded && "hidden")}
          >
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-medium uppercase text-slate-400">
                {projectId ? "Navigation" : "Menu"}
              </h3>
              <nav className="space-y-1">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={
                      item.to === `/projects/${projectId}` ||
                      item.to === "/admin"
                    }
                    className={({ isActive }) =>
                      cn(
                        "flex h-10 items-center justify-between rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-slate-100",
                        isActive && "bg-white/90 shadow",
                      )
                    }
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="size-4 text-slate-600" />
                      {item.label}
                    </span>
                    {item.tag && hasPermission(item.perm ?? "") && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {item.tag}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>

          <div className={cn("border-t p-3", !expanded && "hidden")}>
            <div
              onClick={() => navigate("/profile")}
              className="flex cursor-pointer items-center gap-3 rounded-md border p-2 hover:bg-slate-100"
              title="View profile"
            >
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-indigo-100">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${displayName} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-indigo-700">
                    {initials || "U"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="text-xs text-slate-500">{getRoleLabel()}</p>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleLogout();
                }}
                className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                title="Log out"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
