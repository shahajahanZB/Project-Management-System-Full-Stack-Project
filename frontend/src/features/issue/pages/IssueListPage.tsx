import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  ListFilter,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useGetCurrentUser } from "@/features/auth/hooks";
import { useProject, useProjectMembers } from "@/features/projects/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  issueStatusOptions,
  priorityLabels,
  severityLabels,
  statusLabels,
  typeLabels,
} from "../constants";
import { IssueAvatar } from "../components/IssueAvatar";
import { IssueWorkspaceShell } from "../components/IssueWorkspaceShell";
import { useProjectIssues, useUpdateIssueMutation } from "../hooks";
import type { Issue, IssueStatus, IssueUser } from "../types";
import {
  buildIssueUsers,
  formatIssueDate,
  getUserName,
  issuePriorityTone,
  issueSeverityTone,
  issueTypeTone,
} from "../utils";

export function IssueListPage() {
  const { projectId: projectIdParam } = useParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const hasProjectId = Number.isFinite(projectId) && projectId > 0;

  useDocumentTitle("Project Issues");

  const [search, setSearch] = useState("");
  const issuesQuery = useProjectIssues(projectId, hasProjectId);
  const projectQuery = useProject(projectIdParam);
  const membersQuery = useProjectMembers(projectIdParam);
  const currentUserQuery = useGetCurrentUser();

  const users = useMemo(
    () => buildIssueUsers(membersQuery.data ?? [], currentUserQuery.data),
    [membersQuery.data, currentUserQuery.data],
  );

  const issues = issuesQuery.data ?? [];
  const filteredIssues = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return issues;

    return issues.filter((issue) => {
      const tagNames = issue.tags?.map((tag) => tag.name).join(" ") ?? "";
      return `${issue.id} ${issue.title} ${issue.description} ${tagNames}`
        .toLowerCase()
        .includes(value);
    });
  }, [issues, search]);

  if (!hasProjectId) return <Navigate to="/projects" replace />;

  return (
    <IssueWorkspaceShell>
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {projectQuery.data?.name ?? "Project"}
            </p>
            <h2 className="text-2xl font-semibold text-slate-950">Issues</h2>
          </div>
          <Link
            to={`/projects/${projectId}/issues/new`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-blue-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            New issue
          </Link>
        </div>

        <div className="rounded-lg border bg-white shadow-soft">
          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block max-w-md flex-1">
              <span className="sr-only">Search issues</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="Search title, description, tag, or id"
              />
            </label>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ListFilter className="size-4" aria-hidden="true" />
              {filteredIssues.length} of {issues.length} issues
            </div>
          </div>

          {issuesQuery.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-md bg-slate-100"
                />
              ))}
            </div>
          ) : null}

          {issuesQuery.isError ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto size-8 text-rose-500" />
              <h3 className="mt-3 text-base font-semibold text-slate-950">
                Issues could not be loaded
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                The project issue API did not return data for this project.
              </p>
              <Button
                className="mt-5"
                variant="secondary"
                onClick={() => void issuesQuery.refetch()}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Retry
              </Button>
            </div>
          ) : null}

          {!issuesQuery.isLoading &&
          !issuesQuery.isError &&
          filteredIssues.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-base font-semibold text-slate-950">
                No issues found
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {issues.length === 0
                  ? "This project does not have any issues yet."
                  : "No project issues match the current search."}
              </p>
              <Link
                to={`/projects/${projectId}/issues/new`}
                className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-blue-700"
              >
                <Plus className="size-4" aria-hidden="true" />
                Create issue
              </Link>
            </div>
          ) : null}

          {!issuesQuery.isLoading &&
          !issuesQuery.isError &&
          filteredIssues.length > 0 ? (
            <div className="divide-y">
              {filteredIssues.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  projectId={projectId}
                  users={users}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </IssueWorkspaceShell>
  );
}

type IssueRowProps = {
  issue: Issue;
  projectId: number;
  users: IssueUser[];
};

function IssueRow({ issue, projectId, users }: IssueRowProps) {
  const updateMutation = useUpdateIssueMutation(projectId, issue.id);

  const handleStatusChange = (status: IssueStatus) => {
    updateMutation.mutate({ status });
  };

  return (
    <article className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_170px_150px] lg:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex size-3 rounded-full ${issueTypeTone(issue.type)}`}
            title={typeLabels[issue.type]}
          />
          <Link
            to={`/projects/${projectId}/issues/${issue.id}`}
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            #{issue.id}
          </Link>
          <Link
            to={`/projects/${projectId}/issues/${issue.id}`}
            className="min-w-0 text-sm font-semibold text-slate-950 hover:text-indigo-700"
          >
            {issue.title}
          </Link>
          {issue.isBlocked ? (
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
              Blocked
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
          {issue.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-slate-700">
            <span className={`size-2 rounded-full ${issueSeverityTone(issue.severity)}`} />
            {severityLabels[issue.severity]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-slate-700">
            <span className={`size-2 rounded-full ${issuePriorityTone(issue.priority)}`} />
            {priorityLabels[issue.priority]}
          </span>
          {issue.dueDate ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatIssueDate(issue.dueDate)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {formatIssueDate(issue.updatedAt ?? issue.createdAt)}
          </span>
        </div>
      </div>

      <select
        value={issue.status}
        onChange={(event) => handleStatusChange(event.target.value as IssueStatus)}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        title="Change status"
      >
        {issueStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {statusLabels[option.value]}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-3 lg:justify-end">
        <IssueAvatar
          name={getUserName(users, issue.assigneeId)}
          className="size-9 rounded-full bg-indigo-100 text-indigo-700"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-950">
            {getUserName(users, issue.assigneeId)}
          </p>
          <p className="text-xs text-slate-500">Assignee</p>
        </div>
      </div>
    </article>
  );
}
