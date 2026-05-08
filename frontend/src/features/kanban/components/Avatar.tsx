import { CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KanbanUser } from "../types";
import { initials } from "../utils";

export function Avatar({ user }: { user?: KanbanUser | null }) {
  if (!user) {
    return (
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
        <CircleUserRound className="size-5" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
        user.avatarColor,
      )}
    >
      {initials(user.name)}
    </span>
  );
}
