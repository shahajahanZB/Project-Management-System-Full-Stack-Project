import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  Shield,
  Home,
  User,
  Users,
  Loader2,
  Layers3,
  CheckSquare,
  Users2,
  Settings,
  Moon,
  LogOut,
} from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import { useState } from "react";
import { useGetCurrentUser } from "@/features/auth/hooks";
import { useProject } from "@/features/projects/hooks";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MenuItem = {
  to: string;
  label: string;
  icon: any;
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
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
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
      label: "Epic",
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
  const userQuery: any = useGetCurrentUser();
  const { projectId } = useParams<{ projectId: string }>();
  const projectQuery = useProject(projectId ? parseInt(projectId) : undefined);
  const [expanded, setExpanded] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const roles = (userQuery.data?.roles as any[]) ?? [];
  const permissions: string[] = userQuery.data?.permissions ?? [];
  const isAdmin = roles.some((r: any) =>
    ["ADMIN", "SUPERADMIN"].includes(r?.name ?? r),
  );

  const hasPermission = (perm: string) => isAdmin || permissions.includes(perm);

  const items = projectId
    ? projectMenu(projectId).filter(
        (item) => !item.perm || hasPermission(item.perm),
      )
    : isAdmin
      ? adminMenu()
      : userMenu().filter((item) => !item.perm || hasPermission(item.perm));

  const getRoleLabel = () => {
    const roleList = roles.map((r: any) => r?.name ?? r);
    if (roleList.includes("SUPERADMIN")) return "Superadmin";
    if (roleList.includes("ADMIN")) return "Admin";
    return "Member";
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
        <div className="flex h-16 items-center border-b px-3">
          <div
            className={cn("flex items-center gap-3", !expanded && "mx-auto")}
          >
            {/* <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
              P
            </div> */}
            {expanded && (
              <span className="text-sm font-semibold tracking-wide text-slate-900">
                {projectId
                  ? projectQuery.data?.name || projectQuery.isLoading
                    ? "..."
                    : "Project"
                  : APP_NAME}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Expanded panel - Navigation */}
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

          {/* Settings and Account - Bottom */}
          <div className={cn("border-t p-3", !expanded && "hidden")}>
            <div className="mb-3">
              <h4 className="mb-2 text-xs font-medium uppercase text-slate-400">
                Settings
              </h4>
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  if (!darkMode) {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                }}
                className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Moon className="size-4 text-slate-600" />
                Dark mode
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-md border p-2">
              <div className="h-9 w-9 overflow-hidden rounded-full">
                <img
                  src={userQuery.data?.avatarUrl ?? "https://i.pravatar.cc/40"}
                  alt="avatar"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userQuery.data?.name ?? "User"}
                </p>
                <p className="text-xs text-slate-500">{getRoleLabel()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
