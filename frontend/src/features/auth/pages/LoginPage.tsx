import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "../api";
import { useLoginMutation } from "../hooks";
import { AuthShell } from "../components/AuthShell";

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

export function LoginPage() {
  useDocumentTitle("Login");

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  function isAdminRole(roleName: string) {
    return (
      roleName === "ADMIN" ||
      roleName === "ROLE_ADMIN" ||
      roleName === "SUPERADMIN"
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    loginMutation.mutate(
      {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
      {
        onSuccess: async (session) => {
          if (session.accessToken) {
            localStorage.setItem("authToken", session.accessToken);
          }

          try {
            const currentUser = await getCurrentUser();
            const roles = (currentUser.roles ?? []).map((role) => role.name);
            const hasAdminRole = roles.some(isAdminRole);

            navigate(hasAdminRole ? "/admin" : "/", {
              replace: true,
            });
          } catch {
            navigate("/", { replace: true });
          }
        },
      },
    );
  }

  return (
    <AuthShell
      heroEyebrow="You can easily"
      heroTitle={[
        "Get access to your personal hub",
        "for clarity and productivity",
      ].join("\n")}
      heroDescription="Return to your tasks, notes, and project boards with one calm workspace that keeps the important work in front of you."
      title="Welcome back"
      description="Sign in to continue with your projects, tasks, and notes without losing momentum."
      accentClassName="bg-[radial-gradient(circle_at_18%_58%,rgba(79,70,229,0.96)_0,rgba(79,70,229,0.96)_16%,rgba(109,40,217,0.84)_35%,rgba(125,211,252,0.34)_58%,rgba(224,231,255,0.12)_78%,rgba(255,255,255,0.08)_100%)]"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Your email</span>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              className={cn(inputClassName, "pl-11")}
              type="email"
              name="email"
              placeholder="you@example.com"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              className={cn(inputClassName, "pl-11 pr-12")}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="font-medium text-indigo-600 transition hover:text-indigo-700"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-[0_14px_30px_rgba(79,70,229,0.3)] hover:from-indigo-500 hover:via-violet-500 hover:to-cyan-400"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>

        {loginMutation.isError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {(loginMutation.error as Error).message ||
              "Unable to sign in right now."}
          </p>
        ) : null}

        {loginMutation.isSuccess ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {loginMutation.data.message ?? "Signed in successfully."}
          </p>
        ) : null}

        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>or continue with</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["Be", "G", "f"].map((label, index) => (
            <button
              key={label}
              type="button"
              className={cn(
                "flex h-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200",
                index === 0 && "text-[#1769ff]",
                index === 1 && "text-[#ea4335]",
                index === 2 && "text-[#1877f2]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/sign-up"
            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
