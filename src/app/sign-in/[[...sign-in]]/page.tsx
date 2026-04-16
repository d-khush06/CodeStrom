"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Lock, ShieldCheck, ArrowRight, Globe, GitBranch } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/ThemeToggle";

const inputBase =
  "w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 " +
  "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 " +
  "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500";

export default function Page() {
  const { signIn } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [needsCode, setNeedsCode] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signIn) return;

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn.create({
        identifier: email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Unable to sign in.");
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setError(finalizeError.message || "Unable to finish sign in.");
        }
        return;
      }

      if (signIn.status === "needs_first_factor") {
        const hasEmailCode = signIn.supportedFirstFactors?.some(
          (factor) => factor.strategy === "email_code"
        );

        if (hasEmailCode) {
          const { error: codeError } = await signIn.emailCode.sendCode();
          if (codeError) {
            setError(codeError.message || "Unable to send verification code.");
            return;
          }
          setNeedsCode(true);
          return;
        }
      }

      setError("Additional verification is required for this account.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signIn) return;

    setLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await signIn.emailCode.verifyCode({ code });

      if (verifyError) {
        setError(verifyError.message || "Unable to verify code.");
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setError(finalizeError.message || "Unable to finish sign in.");
        }
        return;
      }

      setError("Verification incomplete. Please try again.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Unable to verify code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(strategy: "oauth_google" | "oauth_github") {
    if (!signIn) return;

    setLoading(true);
    setError(null);

    try {
      await signIn.sso({
        strategy,
        redirectUrl: "/dashboard",
        redirectCallbackUrl: "/sso-callback",
      });
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Unable to start OAuth sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0A0A0B] dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[190px] dark:bg-blue-500/10" />
        <div className="absolute -bottom-48 right-0 h-[440px] w-[440px] rounded-full bg-cyan-500/20 blur-[190px] dark:bg-cyan-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-[0.24em] text-slate-900 dark:text-white">
          CODESTORM
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/sign-up"
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Create account
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 pb-16 pt-6 lg:grid-cols-[0.45fr_0.55fr]">
        <div className="hidden lg:flex flex-col justify-center rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Sign in</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
            Access your cyber workspace
          </h1>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Secure access to dashboards, billing, and profile tools with Clerk authentication.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
              Zero-friction access with trusted security.
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ArrowRight className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              Continue where you left off instantly.
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Welcome back</p>
            <h2 className="mt-2 text-2xl font-bold">Sign in to CodeStorm</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Use your email and password to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
              {error}
            </div>
          )}

          {!needsCode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleOAuth("oauth_google")}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <Globe className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth("oauth_github")}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <GitBranch className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  Continue with GitHub
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                or sign in with email
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Email
                </span>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputBase + " pl-10"}
                    placeholder="you@codestorm.app"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Password
                </span>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputBase + " pl-10"}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.45)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enter the verification code sent to your email.
              </p>
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className={inputBase}
                placeholder="Verification code"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.45)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            New here?{" "}
            <Link href="/sign-up" className="font-semibold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-200">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
