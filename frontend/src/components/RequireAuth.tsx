import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGetCurrentUser } from "@/features/auth/hooks";

type RequireAuthProps = {
  children?: ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem("authToken"));
  const userQuery = useGetCurrentUser(hasToken);

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (userQuery.isLoading) return null;

  if (userQuery.isError || !userQuery.data) {
    localStorage.removeItem("authToken");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}
