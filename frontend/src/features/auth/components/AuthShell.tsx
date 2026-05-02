import type { ReactNode } from "react";
import { Asterisk } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  title: string;
  description: string;
  accentClassName?: string;
  children: ReactNode;
};

export function AuthShell({
  heroEyebrow,
  heroTitle,
  heroDescription,
  title,
  description,
  accentClassName,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(237,233,254,0.95)_36%,_rgba(244,247,255,0.92)_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_90px_rgba(76,29,149,0.18)] lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative isolate min-h-[300px] overflow-hidden p-6 sm:p-8 lg:p-10">
            <div
              className={cn(
                "absolute inset-0 bg-[radial-gradient(circle_at_18%_58%,rgba(67,56,202,0.95)_0,rgba(67,56,202,0.95)_16%,rgba(109,40,217,0.78)_35%,rgba(155,135,245,0.34)_59%,rgba(224,231,255,0.12)_78%,rgba(255,255,255,0.08)_100%)]",
                accentClassName,
              )}
            />
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0)_42%,rgba(255,255,255,0.12)_100%)]" />
            <div className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-cyan-300/45 blur-3xl" />
            <div className="absolute right-4 top-8 h-52 w-52 rounded-full bg-fuchsia-300/35 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/20 blur-3xl" />

            <div className="relative flex h-full min-h-[260px] flex-col justify-between rounded-[1.75rem] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] sm:p-6">
              <Asterisk
                className="size-10 stroke-[2.25] text-white/95"
                aria-hidden="true"
              />
              <div className="max-w-md space-y-4">
                <p className="text-sm font-medium text-white/80">
                  {heroEyebrow}
                </p>
                <h2 className="max-w-sm whitespace-pre-line text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-[2.3rem]">
                  {heroTitle}
                </h2>
                <p className="max-w-sm text-sm leading-6 text-white/80 sm:text-base">
                  {heroDescription}
                </p>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <span className="h-px flex-1 bg-white/25" />
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em]">
                  Focus
                </span>
                <span className="h-px flex-1 bg-white/25" />
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-12">
            <div className="w-full max-w-md">
              <div className="mb-8 inline-flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(79,70,229,0.12),rgba(168,85,247,0.12),rgba(14,165,233,0.12))] text-4xl font-black text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                *
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                  {description}
                </p>
              </div>

              <div className="mt-8">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
