type MetricButtonProps = {
  label: string;
  value: string;
};

export function MetricButton({ label, value }: MetricButtonProps) {
  return (
    <div className="rounded-md bg-slate-100 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
