"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Shield,
  X,
  MoreHorizontal,
  Globe,
  LockKeyhole,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = React.useState<"profile" | "security">(
    "profile"
  );
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [connectOpen, setConnectOpen] = React.useState(false);

  const name = user?.fullName || user?.firstName || user?.username || "User";
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";
  const externalAccounts = user?.externalAccounts || [];

  React.useEffect(() => {
    if (!isLoaded || !user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
  }, [isLoaded, user?.id]);

  async function handleUpdateProfile() {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      if (selectedFile) {
        await user.setProfileImage({ file: selectedFile });
        setSelectedFile(null);
      }

      await user.update({
        firstName: firstName || null,
        lastName: lastName || null,
      });

      setMessage("Profile updated.");
    } catch (err: any) {
      setMessage(err?.errors?.[0]?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConnectAccount(strategy: "oauth_google" | "oauth_github") {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      await user.createExternalAccount({
        strategy,
        redirectUrl: "/account",
      });
    } catch (err: any) {
      setMessage(err?.errors?.[0]?.message || "Unable to connect account.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-[#0A0A0B] dark:text-white">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#18181B]">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
          <aside className="bg-slate-100 p-6 md:border-r md:border-slate-200 dark:bg-[#0A0A0B] dark:border-white/10">
            <div>
              <h1 className="text-lg font-bold">Account</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account info.</p>
            </div>

            <nav className="mt-6 space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold " +
                  (activeTab === "profile"
                    ? "bg-white/70 text-slate-900 dark:bg-white/10 dark:text-white"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white")
                }
              >
                <User className="h-4 w-4 text-slate-400 dark:text-slate-300" />
                Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold " +
                  (activeTab === "security"
                    ? "bg-white/70 text-slate-900 dark:bg-white/10 dark:text-white"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white")
                }
              >
                <Shield className="h-4 w-4" />
                Security
              </button>
            </nav>
          </aside>

          <section className="bg-white p-6 dark:bg-[#18181B]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Profile details</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Keep your identity up to date and secure.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 space-y-6">
              {message && (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {message}
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <LockKeyhole className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Password</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user?.passwordEnabled ? "Enabled" : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Two-factor auth</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user?.twoFactorEnabled ? "Enabled" : "Not enabled"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <>
              <div className="border-b border-slate-200 pb-6 dark:border-white/5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr_auto] md:items-center">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Profile</p>
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white dark:border-white/10 dark:bg-white/10">
                      {isLoaded && user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          ?
                        </span>
                      )}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {isLoaded ? name : "Account"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? "Updating..." : "Update profile"}
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    First name
                    <input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                      placeholder="First name"
                    />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Last name
                    <input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                      placeholder="Last name"
                    />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Profile photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setSelectedFile(event.target.files?.[0] || null)
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </label>
                </div>
              </div>

              <div className="border-b border-slate-200 pb-6 dark:border-white/5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr_auto] md:items-center">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Email addresses</p>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <span>{isLoaded ? email || "No email" : ""}</span>
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  </div>
                  <div />
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Add email address
                </button>
              </div>

              <div className="pb-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr_auto] md:items-center">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Connected accounts</p>
                  <div className="space-y-2">
                    {externalAccounts.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                        No connected accounts yet.
                      </div>
                    ) : (
                      externalAccounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        >
                          <span className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            {account.providerTitle()} • {account.emailAddress}
                          </span>
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </div>
                      ))
                    )}
                  </div>
                  <div />
                </div>
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
                  onClick={() => setConnectOpen((value) => !value)}
                >
                  + Connect account
                </button>
                {connectOpen && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleConnectAccount("oauth_google")}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      Connect Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConnectAccount("oauth_github")}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <Globe className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      Connect GitHub
                    </button>
                  </div>
                )}
              </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
