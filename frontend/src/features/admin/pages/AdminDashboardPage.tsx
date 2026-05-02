import { Moon, Shield, Sun } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function AdminDashboardPage() {
  useDocumentTitle("Admin Dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode((current) => !current);

  return (
    <div
      className={
        isDarkMode
          ? "min-h-screen bg-slate-950 text-slate-100"
          : "min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900"
      }
    >
      <div className="mx-auto max-w-[1500px] px-4 lg:px-6">
        <main className="w-full py-6 lg:py-8">
          <div
            className={
              isDarkMode
                ? "p-0 bg-transparent text-slate-100"
                : "p-0 bg-transparent text-slate-900"
            }
          >
            <div>
              <Outlet context={{ isDarkMode }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
