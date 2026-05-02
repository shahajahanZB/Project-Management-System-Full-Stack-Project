import { Navigate } from "react-router-dom";
import { useGetCurrentUser } from "@/features/auth/hooks";

type RequirePermissionProps = {
  perm: string;
  children: JSX.Element;
};

export default function RequirePermission({
  perm,
  children,
}: RequirePermissionProps) {
  const userQuery: any = useGetCurrentUser();

  if (userQuery.isLoading) return null;

  const roles = userQuery.data?.roles ?? [];
  const isAdmin = roles.some((r: any) =>
    ["ADMIN", "SUPERADMIN"].includes(r?.name ?? r),
  );
  const permissions: string[] = userQuery.data?.permissions ?? [];
  const hasPermission = isAdmin || permissions.includes(perm);

  if (!hasPermission) return <Navigate to="/unauthorized" replace />;

  return children;
}
