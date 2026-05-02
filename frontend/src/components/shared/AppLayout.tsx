import { Outlet, useLocation } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import GlobalSidebar from "@/components/GlobalSidebar";

export function AppLayout() {
  const location = useLocation();
  const noChromeRoutes = [
    "/login",
    "/sign-up",
    "/forgot-password",
    "/verify-otp",
    "/dashboard",
  ];
  const isNoChromeRoute =
    noChromeRoutes.includes(location.pathname) || location.pathname === "/";

  if (isNoChromeRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalSidebar />

      <div className="lg:pl-64">
        {/* <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Workspace
            </p>
            <h1 className="text-base font-semibold text-slate-950">
              Engineering Delivery
            </h1>
          </div>
        </header> */}
        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
