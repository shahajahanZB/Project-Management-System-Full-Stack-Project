import type { FormEvent } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";

type AddColumnFormProps = {
  isAdding: boolean;
  columnName: string;
  isSaving: boolean;
  onColumnNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onStart: () => void;
  onCancel: () => void;
};

export function AddColumnForm({
  isAdding,
  columnName,
  isSaving,
  onColumnNameChange,
  onSubmit,
  onStart,
  onCancel,
}: AddColumnFormProps) {
  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={onStart}
        className="flex h-12 items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-teal-400 hover:text-teal-700"
      >
        <Plus className="size-4" />
        Add column
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-12 items-center gap-2 rounded-md border border-teal-300 bg-white p-2 shadow-soft"
    >
      <input
        value={columnName}
        onChange={(event) => onColumnNameChange(event.target.value)}
        autoFocus
        placeholder="New column name"
        className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex size-8 items-center justify-center rounded bg-teal-600 text-white transition hover:bg-teal-700 disabled:opacity-50"
        title="Create column"
      >
        {isSaving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex size-8 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        title="Cancel"
      >
        <X className="size-4" />
      </button>
    </form>
  );
}
