import { AlertCircle, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Role } from "@/features/auth/types";

type RoleManagementSectionProps = {
  roles: Role[] | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  isDarkMode: boolean;
};

export function RoleManagementSection({
  roles,
  isLoading,
  isError,
  errorMessage,
  isDarkMode,
}: RoleManagementSectionProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
          Loading roles...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading roles</h3>
            <p className="text-sm text-red-700">
              {errorMessage || "Unable to fetch roles"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold">All Roles</h3>
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus className="size-4" />
          Create Role
        </Button>
      </div>

      {(roles?.length ?? 0) === 0 ? (
        <div
          className={
            isDarkMode
              ? "rounded-lg border border-slate-800 bg-slate-950 p-8 text-center"
              : "rounded-lg border border-slate-200 bg-slate-50 p-8 text-center"
          }
        >
          <Shield className="mx-auto mb-3 size-8 text-slate-400" />
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
            No roles found
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles?.map((role) => (
            <div
              key={role.id}
              className={
                isDarkMode
                  ? "rounded-lg border border-slate-800 bg-slate-950 p-4"
                  : "rounded-lg border border-slate-200 p-4 hover:border-indigo-300"
              }
            >
              <h4 className="font-semibold">{role.name}</h4>
              <p
                className={
                  isDarkMode
                    ? "mt-2 text-sm text-slate-400"
                    : "mt-2 text-sm text-slate-600"
                }
              >
                {role.permissions?.length ?? 0} permissions
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className={
                    isDarkMode
                      ? "flex-1 rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
                      : "flex-1 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200"
                  }
                >
                  Edit
                </button>
                <button className="flex-1 rounded-md bg-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-200">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
