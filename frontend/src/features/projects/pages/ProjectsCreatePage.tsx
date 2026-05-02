import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProject } from "@/features/projects/hooks";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      response?: { data?: unknown; status?: number };
      message?: unknown;
    };

    const data = candidate.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
    ) {
      return (data as { error: string }).error;
    }
    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }
    if (candidate.response?.status) {
      return `Request failed with status code ${candidate.response.status}`;
    }
  }

  return "Project creation failed.";
}

export function ProjectsCreatePage() {
  useDocumentTitle("Create project");
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const [createState, setCreateState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!name || !description) {
      setCreateState("error");
      setErrorMessage("Project name and description are required.");
      return;
    }

    try {
      const created = await createProject.mutateAsync({ name, description });
      setCreateState("success");
      setCreatedProjectId(created.id);
      setErrorMessage(null);
      navigate(`/projects/${created.id}`);
    } catch (err) {
      setCreateState("error");
      setErrorMessage(getErrorMessage(err));
      console.error(err);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Delivery</p>
          <h2 className="text-2xl font-semibold text-slate-950">
            Create Project
          </h2>
          {createState === "success" ? (
            <p className="mt-1 text-sm text-emerald-600">
              Project created{createdProjectId ? `: ${createdProjectId}` : ""}.
            </p>
          ) : null}
          {createState === "error" ? (
            <p className="mt-1 text-sm text-rose-600">
              {errorMessage ?? "Project creation failed."}
            </p>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border bg-white p-6"
      >
        <label className="block">
          <span className="text-sm text-slate-600">Project name</span>
          <input
            name="name"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-600">Description</span>
          <textarea
            name="description"
            rows={4}
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={createProject.isPending}
            className="rounded-md bg-indigo-600 text-white disabled:opacity-60"
          >
            {createProject.isPending ? "Creating..." : "Create"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/projects")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}
