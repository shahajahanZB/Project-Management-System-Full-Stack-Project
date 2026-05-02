import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
import { useResetPasswordMutation } from "../hooks";
import { AuthShell } from "../components/AuthShell";

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

export function VerifyOtpPage() {
  useDocumentTitle("Verify OTP");

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPasswordMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    resetPasswordMutation.mutate(
      {
        email: String(formData.get("email") ?? ""),
        otp: String(formData.get("otp") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
      },
      {
        onSuccess: () => {
          navigate("/login", { replace: true });
        },
      },
    );
  }

  return (
    <AuthShell
      heroEyebrow="You're almost there"
      heroTitle={["Verify your identity", "and reset your password"].join("\n")}
      heroDescription="Enter the OTP sent to your email and create a new password to regain access to your account."
      title="Verify OTP & Reset Password"
      description="We sent a one-time password (OTP) to your email. Enter it below along with your new password."
      accentClassName="bg-[radial-gradient(circle_at_20%_58%,rgba(34,197,94,0.94)_0,rgba(34,197,94,0.94)_16%,rgba(99,102,241,0.8)_36%,rgba(45,212,191,0.32)_58%,rgba(224,231,255,0.12)_78%,rgba(255,255,255,0.08)_100%)]"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
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
              placeholder="your@example.com"
              required
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">OTP</span>
          <div className="relative">
            <ShieldCheck
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              className={cn(inputClassName, "pl-11 tracking-widest")}
              type="text"
              name="otp"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>
          <p className="text-xs text-slate-500">
            Enter the 6-digit code sent to your email
          </p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">
            New Password
          </span>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              className={cn(inputClassName, "pl-11 pr-12")}
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Create a strong password"
              required
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
          <p className="text-xs text-slate-500">
            At least 8 characters with uppercase, lowercase, and numbers
          </p>
        </label>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm leading-6 text-slate-600">
          <div className="mb-2 inline-flex items-center gap-2 font-medium text-emerald-700">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Secure reset
          </div>
          Your password will be updated immediately after verification.
        </div>

        <Button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-[0_14px_30px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-400"
        >
          {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
        </Button>

        {resetPasswordMutation.isError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {(resetPasswordMutation.error as Error).message ||
              "Unable to reset password. Please check your OTP and try again."}
          </p>
        ) : null}

        {resetPasswordMutation.isSuccess ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {resetPasswordMutation.data.message ??
              "Password reset successfully. Redirecting to login..."}
          </p>
        ) : null}

        <p className="text-center text-sm text-slate-500">
          Didn't receive OTP?{" "}
          <Link
            to="/forgot-password"
            className="font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            Request new OTP
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
