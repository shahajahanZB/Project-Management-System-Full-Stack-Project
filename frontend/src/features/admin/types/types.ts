import type { LucideIcon } from "lucide-react";

export type AdminTab = "users" | "roles" | "permissions" | "settings";

export type AdminSidebarItem = {
  id: AdminTab;
  label: string;
  description: string;
  icon: LucideIcon;
};
