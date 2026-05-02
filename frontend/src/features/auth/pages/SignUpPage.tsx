import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
import { useSignUpMutation } from "../hooks";
import { AuthShell } from "../components/AuthShell";

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

export function SignUpPage() {
  useDocumentTitle("Sign up");

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const signUpMutation = useSignUpMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    signUpMutation.mutate(
      {
        username: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        roleIds: [],
      },
      {
        onSuccess: (session) => {
          if (session.accessToken) {
            localStorage.setItem("authToken", session.accessToken);
          }
          navigate("/projects", { replace: true });
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
      heroDescription="Create a workspace that keeps your projects, notes, and next steps in one focused place."
      title="Create an account"
      description="Start quickly and keep your work flowing in one organized dashboard."
      accentClassName="bg-[radial-gradient(circle_at_20%_58%,rgba(88,28,135,0.96)_0,rgba(88,28,135,0.96)_16%,rgba(99,102,241,0.82)_37%,rgba(56,189,248,0.34)_58%,rgba(224,231,255,0.12)_78%,rgba(255,255,255,0.08)_100%)]"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              className={cn(inputClassName, "pl-11")}
              type="text"
              name="name"
              placeholder="Your full name"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
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
              placeholder="Create a password"
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

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            I agree to the{" "}
            <a
              href="#"
              className="font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <Button
          type="submit"
          disabled={signUpMutation.isPending}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-[0_14px_30px_rgba(79,70,229,0.3)] hover:from-indigo-500 hover:via-violet-500 hover:to-cyan-400"
        >
          {signUpMutation.isPending ? "Creating account..." : "Get started"}
        </Button>

        {signUpMutation.isError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {(signUpMutation.error as Error).message ||
              "Unable to create your account right now."}
          </p>
        ) : null}

        {signUpMutation.isSuccess ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {signUpMutation.data.message ?? "Account created successfully."}
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
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
