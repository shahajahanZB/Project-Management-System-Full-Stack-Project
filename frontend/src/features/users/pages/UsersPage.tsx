import { useEffect, useState, type FormEvent } from "react";
import { useGetCurrentUser, useGetUserProfile, useUpdateUserProfileMutation } from "@/features/auth/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/Button";
import type { UserProfile } from "@/features/auth/types";

const emptyProfile: UserProfile = {
  fullName: "",
  jobTitle: "",
  department: "",
  employeeCode: "",
  location: "",
  avatarUrl: "",
  phoneNumber: "",
  githubUsername: "",
  bio: "",
};

export function UsersPage() {
  useDocumentTitle("User Profile");

  const currentUserQuery = useGetCurrentUser();
  const currentUserId = currentUserQuery.data?.id;
  const profileQuery = useGetUserProfile(currentUserId);
  const updateProfileMutation = useUpdateUserProfileMutation();

  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profileQuery.data) {
      setProfile({ ...emptyProfile, ...profileQuery.data });
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (!currentUserId) {
      setProfile(emptyProfile);
    }
  }, [currentUserId]);

  const isLoading = currentUserQuery.isLoading || profileQuery.isLoading;

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!currentUserId) {
      setStatusMessage("Unable to determine current user.");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        userId: currentUserId,
        payload: profile,
      });
      setStatusMessage("Profile saved successfully.");
    } catch (error) {
      setStatusMessage(
        (error as Error)?.message || "Unable to save profile. Please try again.",
      );
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">User</p>
        <h2 className="text-2xl font-semibold text-slate-950">Profile</h2>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-slate-600">Loading profile...</p>
        ) : currentUserQuery.error ? (
          <p className="text-rose-600">Unable to load user: {(currentUserQuery.error as Error)?.message}</p>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  type="text"
                  value={profile.fullName ?? ""}
                  onChange={(event) => handleChange("fullName", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Job title</span>
                <input
                  type="text"
                  value={profile.jobTitle ?? ""}
                  onChange={(event) => handleChange("jobTitle", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Department</span>
                <input
                  type="text"
                  value={profile.department ?? ""}
                  onChange={(event) => handleChange("department", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Employee code</span>
                <input
                  type="text"
                  value={profile.employeeCode ?? ""}
                  onChange={(event) => handleChange("employeeCode", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Location</span>
                <input
                  type="text"
                  value={profile.location ?? ""}
                  onChange={(event) => handleChange("location", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Phone number</span>
                <input
                  type="tel"
                  value={profile.phoneNumber ?? ""}
                  onChange={(event) => handleChange("phoneNumber", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">GitHub username</span>
                <input
                  type="text"
                  value={profile.githubUsername ?? ""}
                  onChange={(event) => handleChange("githubUsername", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Avatar URL</span>
                <input
                  type="text"
                  value={profile.avatarUrl ?? ""}
                  onChange={(event) => handleChange("avatarUrl", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Bio</span>
              <textarea
                value={profile.bio ?? ""}
                onChange={(event) => handleChange("bio", event.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">User ID: {currentUserId}</p>
                <p className="text-sm text-slate-500">Email: {currentUserQuery.data?.email}</p>
              </div>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save profile"}
              </Button>
            </div>

            {statusMessage ? (
              <p className="text-sm text-slate-600">{statusMessage}</p>
            ) : null}
            {updateProfileMutation.error ? (
              <p className="text-sm text-rose-600">
                {(updateProfileMutation.error as Error)?.message ?? "Profile update failed."}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}
