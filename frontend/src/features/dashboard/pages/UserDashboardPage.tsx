import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useGetCurrentUser } from "@/features/auth/hooks";
import { useNavigate } from "react-router-dom";

export function UserDashboardPage() {
  useDocumentTitle("My Dashboard");

  const navigate = useNavigate();
  const currentUserQuery = useGetCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

  const stats = [
    {
      label: "Projects",
      value: "12",
      icon: CheckCircle2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Active Tasks",
      value: "8",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Completed",
      value: "45",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Due Soon",
      value: "3",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-600 p-3">
              <User className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome{" "}
                {currentUserQuery.data?.username
                  ? `, ${currentUserQuery.data.username}`
                  : ""}
              </h1>
              <p className="mt-1 text-slate-600">
                Here's your project overview
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-600 transition hover:bg-red-200"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>

        {/* User Info */}
        {currentUserQuery.isLoading ? (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <p className="text-slate-600">Loading user info...</p>
          </div>
        ) : currentUserQuery.data ? (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-slate-600">Username</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {currentUserQuery.data.username}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {currentUserQuery.data.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Roles</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {currentUserQuery.data.roles &&
                  currentUserQuery.data.roles.length > 0 ? (
                    currentUserQuery.data.roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700"
                      >
                        {role.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">No roles assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-lg ${stat.bgColor} p-3`}>
                    <Icon className={`size-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Recent Projects */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Recent Projects
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3 hover:border-indigo-300"
                >
                  <div>
                    <p className="font-medium text-slate-900">Project {i}</p>
                    <p className="text-sm text-slate-500">3 tasks active</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="size-4" />
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full border border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50">
              View All Projects
            </Button>
          </div>

          {/* Upcoming Tasks */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Upcoming Tasks
            </h2>
            <div className="space-y-3">
              {[
                { name: "Design mockups", date: "Today" },
                { name: "Client review", date: "Tomorrow" },
                { name: "Code review", date: "In 2 days" },
              ].map((task, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3 hover:border-orange-300"
                >
                  <div>
                    <p className="font-medium text-slate-900">{task.name}</p>
                    <p className="text-sm text-slate-500">{task.date}</p>
                  </div>
                  <Clock className="size-4 text-orange-500" />
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full border border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50">
              View All Tasks
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Quick Actions
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Button className="border border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
              New Project
            </Button>
            <Button className="border border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
              Add Task
            </Button>
            <Button className="border border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
              View Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
