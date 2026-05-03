import type {
  IssuePriority,
  IssueSeverity,
  IssueStatus,
  IssueType,
} from "./types";

export const issueStatusOptions: Array<{ value: IssueStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "READY_FOR_TEST", label: "Ready For Test" },
  { value: "CLOSED", label: "Closed" },
  { value: "NEEDS_INFO", label: "Needs Info" },
  { value: "REJECTED", label: "Rejected" },
  { value: "POSTPONED", label: "Postponed" },
];

export const issueTypeOptions: Array<{ value: IssueType; label: string }> = [
  { value: "BUG", label: "Bug" },
  { value: "QUESTION", label: "Question" },
  { value: "ENHANCEMENT", label: "Enhancement" },
];

export const issuePriorityOptions: Array<{
  value: IssuePriority;
  label: string;
}> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export const issueSeverityOptions: Array<{
  value: IssueSeverity;
  label: string;
}> = [
  { value: "OPTIONAL", label: "Optional" },
  { value: "MINOR", label: "Minor" },
  { value: "NORMAL", label: "Normal" },
  { value: "IMPORTANT", label: "Important" },
  { value: "CRITICAL", label: "Critical" },
];

export const statusLabels = Object.fromEntries(
  issueStatusOptions.map((option) => [option.value, option.label]),
) as Record<IssueStatus, string>;

export const typeLabels = Object.fromEntries(
  issueTypeOptions.map((option) => [option.value, option.label]),
) as Record<IssueType, string>;

export const priorityLabels = Object.fromEntries(
  issuePriorityOptions.map((option) => [option.value, option.label]),
) as Record<IssuePriority, string>;

export const severityLabels = Object.fromEntries(
  issueSeverityOptions.map((option) => [option.value, option.label]),
) as Record<IssueSeverity, string>;
