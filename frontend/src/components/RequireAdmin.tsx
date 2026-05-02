import { Navigate } from "react-router-dom";
import { useGetCurrentUser } from "@/features/auth/hooks";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const userQuery: any = useGetCurrentUser();

  if (userQuery.isLoading) return null;

  const roles = userQuery.data?.roles ?? [];
  const isAdmin = roles.some((r: any) =>
    ["ADMIN", "SUPERADMIN"].includes(r?.name ?? r),
  );

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
