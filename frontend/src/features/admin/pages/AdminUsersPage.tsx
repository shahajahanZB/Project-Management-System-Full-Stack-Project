import { useOutletContext } from "react-router-dom";
import { useGetAllUsers, useDeleteUserMutation } from "@/features/auth/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { UserManagementSection } from "@/features/admin/components/UserManagementSection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type Context = { isDarkMode: boolean };

export default function AdminUsersPage() {
  useDocumentTitle("Admin - Users");
  const { isDarkMode } = useOutletContext<Context>();

  const usersQuery = useGetAllUsers();
  const deleteUserMutation = useDeleteUserMutation();
  const queryClient = useQueryClient();

  return (
    <UserManagementSection
      users={usersQuery.data}
      isLoading={usersQuery.isLoading}
      isError={usersQuery.isError}
      errorMessage={(usersQuery.error as Error)?.message ?? ""}
      isDarkMode={isDarkMode}
      isDeleting={deleteUserMutation.isPending}
      onDeleteUser={async (userId) => {
        const ok = window.confirm(
          "Are you sure you want to delete this user? This action cannot be undone.",
        );
        if (!ok) return;
        try {
          await deleteUserMutation.mutateAsync(userId);
          await queryClient.invalidateQueries({ queryKey: ["users"] });
        } catch (err) {
          // simple fallback: show alert
          alert((err as any)?.message ?? "Failed to delete user");
        }
      }}
    />
  );
}
