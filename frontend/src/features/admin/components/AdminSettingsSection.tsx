type AdminSettingsSectionProps = {
  isDarkMode: boolean;
};

export function AdminSettingsSection({
  isDarkMode,
}: AdminSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div
        className={
          isDarkMode
            ? "rounded-xl border border-slate-800 bg-slate-950 p-5"
            : "rounded-xl border border-slate-200 bg-slate-50 p-5"
        }
      >
        <h3 className="text-lg font-semibold">Admin Settings</h3>
        <p
          className={
            isDarkMode
              ? "mt-2 text-sm text-slate-400"
              : "mt-2 text-sm text-slate-600"
          }
        >
          This section is scaffolded for your next phase. You can plug in system
          settings, audit controls, notifications, and workspace preferences
          here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div
          className={
            isDarkMode
              ? "rounded-xl border border-slate-800 bg-slate-950 p-5"
              : "rounded-xl border border-slate-200 bg-white p-5"
          }
        >
          <p className="text-sm font-semibold">Appearance</p>
          <p
            className={
              isDarkMode
                ? "mt-1 text-sm text-slate-400"
                : "mt-1 text-sm text-slate-600"
            }
          >
            Theme control is enabled using the dark mode toggle in the sidebar.
          </p>
        </div>

        <div
          className={
            isDarkMode
              ? "rounded-xl border border-slate-800 bg-slate-950 p-5"
              : "rounded-xl border border-slate-200 bg-white p-5"
          }
        >
          <p className="text-sm font-semibold">System Flags</p>
          <p
            className={
              isDarkMode
                ? "mt-1 text-sm text-slate-400"
                : "mt-1 text-sm text-slate-600"
            }
          >
            Add feature toggles, thresholds, and admin-only options here.
          </p>
        </div>
      </div>
    </div>
  );
}
