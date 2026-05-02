import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EpicCreateModalProps {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  isLoading: boolean;
}

export function EpicCreateModal({
  onClose,
  onCreate,
  isLoading,
}: EpicCreateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Epic name is required");
      return;
    }

    try {
      setError("");
      await onCreate(name);
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create epic");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">New Epic</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-slate-100"
            disabled={isLoading}
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Subject *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Enter epic name"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please add descriptive text to help others better understand this epic"
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            className="flex-1 bg-teal-500 text-white hover:bg-teal-600"
          >
            {isLoading ? "Creating…" : "Create Epic"}
          </Button>
          <Button onClick={onClose} variant="secondary" disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
