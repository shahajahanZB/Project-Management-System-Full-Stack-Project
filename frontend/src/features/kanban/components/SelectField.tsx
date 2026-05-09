import { ChevronDown } from "lucide-react";

type SelectFieldProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-bold uppercase text-slate-500">
        {label}
      </span>
      <div className="relative mt-1">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 pr-9 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}
