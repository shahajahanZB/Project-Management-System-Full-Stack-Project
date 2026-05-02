import { Mail, ShieldCheck } from "lucide-react";
import { type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
import { useRequestPasswordResetOTPMutation } from "../hooks";
import { AuthShell } from "../components/AuthShell";

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

export function ForgotPasswordPage() {
  useDocumentTitle("Forgot password");

  const navigate = useNavigate();
  const forgotPasswordMutation = useRequestPasswordResetOTPMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    forgotPasswordMutation.mutate({
      email: String(formData.get("email") ?? ""),
    });
  }

  return (
    <AuthShell
      heroEyebrow="You can easily"
      heroTitle={["Reset access", "and keep your work moving"].join("\n")}
      heroDescription="We will send a one-time password to your email so you can reset your password securely."
      title="Forgot your password?"
      description="Enter the email address linked to your account and we will send an OTP."
      accentClassName="bg-[radial-gradient(circle_at_20%_58%,rgba(30,64,175,0.94)_0,rgba(30,64,175,0.94)_16%,rgba(99,102,241,0.8)_36%,rgba(45,212,191,0.32)_58%,rgba(224,231,255,0.12)_78%,rgba(255,255,255,0.08)_100%)]"
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
              placeholder="you@example.com"
              required
            />
          </div>
        </label>

        <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm leading-6 text-slate-600">
          <div className="mb-2 inline-flex items-center gap-2 font-medium text-cyan-700">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Secure reset
          </div>
          We will send a one-time password to verify your identity.
        </div>

        <Button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-[0_14px_30px_rgba(79,70,229,0.3)] hover:from-indigo-500 hover:via-violet-500 hover:to-cyan-400"
        >
          {forgotPasswordMutation.isPending ? "Sending OTP..." : "Send OTP"}
        </Button>

        {forgotPasswordMutation.isError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {(forgotPasswordMutation.error as Error).message ||
              "Unable to send OTP right now."}
          </p>
        ) : null}

        {forgotPasswordMutation.isSuccess ? (
          <div className="space-y-3">
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {forgotPasswordMutation.data.message ??
                "OTP sent to your email. Check your inbox."}
            </p>
            <Button
              type="button"
              onClick={() => navigate("/verify-otp")}
              className="h-11 w-full rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
            >
              Verify OTP
            </Button>
          </div>
        ) : null}

        <p className="text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Back to login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
