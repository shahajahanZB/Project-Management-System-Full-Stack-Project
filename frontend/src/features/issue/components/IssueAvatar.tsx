import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type IssueAvatarProps = {
  name?: string;
  className?: string;
};

export function IssueAvatar({ name = "User", className }: IssueAvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-rose-300 text-white",
        className ?? "size-10",
      )}
      title={name}
    >
      <Shield className="size-5" aria-hidden="true" />
      <span className="sr-only">{initials || name}</span>
    </span>
  );
}
