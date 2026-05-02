import { useNavigate } from "react-router-dom";
import type { Epic } from "../types";

interface EpicListTableProps {
  epics: Epic[];
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-slate-100 text-slate-800",
};

export function EpicListTable({ epics }: EpicListTableProps) {
  const navigate = useNavigate();

  if (epics.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center shadow-soft">
        <p className="text-slate-600">
          No epics yet. Create your first epic to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Progress
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Assigned
              </th>
            </tr>
          </thead>
          <tbody>
            {epics.map((epic) => (
              <tr
                key={epic.id}
                onClick={() =>
                  navigate(`/projects/${epic.projectId}/epics/${epic.id}`)
                }
                className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-950">
                  #{epic.id} {epic.name}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      statusColors[epic.status] || "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {epic.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <div className="w-full max-w-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all"
                          style={{ width: `${epic.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500 min-w-fit">
                        {epic.progress}%
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {epic.assignedUserIds.length} user(s)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
