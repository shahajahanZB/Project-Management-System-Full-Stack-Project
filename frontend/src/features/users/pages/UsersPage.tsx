import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function UsersPage() {
  useDocumentTitle("Users");

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Issue</p>
        <h2 className="text-2xl font-semibold text-slate-950">Users</h2>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-slate-600">User management content goes here.</p>
      </div>
    </section>
  );
}
