import { useParams, useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Mail, User as UserIcon, Lock, Shield } from "lucide-react";
import { useGetAllUsers } from "@/features/auth/hooks";
import { Button } from "@/components/ui/Button";
import type { User } from "@/features/auth/types";

type Context = { isDarkMode: boolean };

export default function AdminUserDetailPage() {
  useDocumentTitle("Admin - User Detail");
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext<Context>();

  const usersQuery = useGetAllUsers();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (usersQuery.data && userId) {
      const found = usersQuery.data.find((u) => u.id === Number(userId));
      setUser(found ?? null);
    }
  }, [usersQuery.data, userId]);

  if (usersQuery.isLoading) {
    return (
      <div
        className={`py-8 text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
      >
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`rounded-lg border p-8 text-center ${isDarkMode ? "border-slate-800 bg-slate-950 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"}`}
      >
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      {/* User Header */}
      <div
        className={`rounded-lg border p-6 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`rounded-full p-4 ${isDarkMode ? "bg-slate-800" : "bg-indigo-100"}`}
          >
            <UserIcon
              className={`size-8 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}
            />
          </div>
          <div>
            <h1
              className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {user.username}
            </h1>
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              User ID: {user.id}
            </p>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div
        className={`rounded-lg border p-6 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
      >
        <h2
          className={`mb-4 text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          User Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail
              className={`size-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}
            />
            <div>
              <p
                className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Email
              </p>
              <p className={isDarkMode ? "text-white" : "text-slate-900"}>
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles */}
      <div
        className={`rounded-lg border p-6 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
      >
        <div className="mb-4 flex items-center gap-2">
          <Shield
            className={`size-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          />
          <h2
            className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Assigned Roles
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <span
                key={role.id}
                className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {role.name}
              </span>
            ))
          ) : (
            <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              No roles assigned
            </span>
          )}
        </div>
      </div>

      {/* Permissions */}
      {user.roles && user.roles.length > 0 && (
        <div
          className={`rounded-lg border p-6 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
        >
          <div className="mb-4 flex items-center gap-2">
            <Lock
              className={`size-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`}
            />
            <h2
              className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Permissions
            </h2>
          </div>
          <div className="space-y-3">
            {user.roles.map((role) => (
              <div key={role.id}>
                <p
                  className={`mb-2 font-medium ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}
                >
                  {role.name}
                </p>
                <div className="ml-4 flex flex-wrap gap-2">
                  {role.permissions && role.permissions.length > 0 ? (
                    role.permissions.map((perm) => (
                      <span
                        key={perm.id}
                        className={`rounded-md px-2 py-1 text-xs font-medium ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}
                      >
                        {perm.access}
                      </span>
                    ))
                  ) : (
                    <span
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      }
                    >
                      No permissions
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
