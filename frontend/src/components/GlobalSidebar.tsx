import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  Shield,
  User,
  Users,
  Search,
  Bell,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useGetCurrentUser } from "@/features/auth/hooks";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MenuItem = {
  to: string;
  label: string;
  icon: any;
};

function adminMenu(): MenuItem[] {
  return [
    { to: "/admin", label: "Admin Home", icon: Shield },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/roles", label: "Roles & Permissions", icon: User },
    { to: "/admin/roles/members", label: "Manage Members", icon: Users },
  ];
}

function userMenu(): MenuItem[] {
  return [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/tasks", label: "Tasks", icon: Activity },
  ];
}

export default function GlobalSidebar() {
  const userQuery: any = useGetCurrentUser();
  const [expanded, setExpanded] = useState(true);

  const roles = (userQuery.data?.roles as any[]) ?? [];
  const isAdmin = roles.some((r: any) =>
    ["ADMIN", "SUPERADMIN"].includes(r?.name ?? r),
  );

  const items = isAdmin ? adminMenu() : userMenu();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-3">
          <div
            className={cn("flex items-center gap-3", !expanded && "mx-auto")}
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
              P
            </div>
            {expanded && (
              <span className="text-sm font-semibold tracking-wide text-slate-900">
                {APP_NAME}
              </span>
            )}
          </div>
          {/* <button
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded border bg-white text-slate-600"
          >
            {expanded ? (
              <ChevronLeft className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button> */}
        </div>

        <div className="flex flex-1 overflow-y-auto">
          {/* Icon rail */}
          {/* <div
            className={cn(
              "flex flex-col items-center gap-2 border-r p-2 pt-4",
              expanded ? "w-16" : "w-16",
            )}
          >
            <button className="rounded p-2 hover:bg-slate-100">
              <Search className="size-4 text-slate-600" />
            </button>
            <button className="rounded p-2 hover:bg-slate-100">
              <Inbox className="size-4 text-slate-600" />
            </button>
            <button className="rounded p-2 hover:bg-slate-100">
              <Bell className="size-4 text-slate-600" />
            </button>
            <div className="my-2 h-px w-full bg-slate-100" />
            <button className="rounded p-2 hover:bg-slate-100">
              <Activity className="size-4 text-slate-600" />
            </button>
          </div> */}

          {/* Expanded panel */}
          <div className={cn("flex-1 p-3", !expanded && "hidden")}>
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-medium uppercase text-slate-400">
                Menu
              </h3>
              <nav className="space-y-1">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-slate-100",
                        isActive && "bg-white/90 shadow",
                      )
                    }
                  >
                    <item.icon className="size-4 text-slate-600" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* <div className="mt-auto">
              <div className="mb-3">
                <h4 className="mb-2 text-xs font-medium uppercase text-slate-400">
                  Preferences
                </h4>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      🌙
                    </span>
                    <div>
                      <p className="text-sm">Dark mode</p>
                      <p className="text-xs text-slate-500">Appearance</p>
                    </div>
                  </div>
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded border bg-white text-slate-600">
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-md border p-2">
                <div className="h-9 w-9 overflow-hidden rounded-full">
                  <img
                    src={
                      userQuery.data?.avatarUrl ?? "https://i.pravatar.cc/40"
                    }
                    alt="avatar"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {userQuery.data?.name ?? "Guest User"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isAdmin ? "Admin" : "Member"}
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </aside>
  );
}
