import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function AdminHomePage() {
  useDocumentTitle("Admin Home");

  return (
    <div>
      <h3 className="text-lg font-semibold">Welcome to Admin Console</h3>
      <p className="mt-2 text-sm text-slate-600">
        Choose an item from the left to begin.
      </p>
    </div>
  );
}
