import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function ProjectIssuesPage() {
  useDocumentTitle("Issues");

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-500">Project</p>
        <h2 className="text-2xl font-semibold text-slate-950">Issues</h2>
      </div>
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-slate-600">Issues page - coming soon</p>
      </div>
    </section>
  );
}
