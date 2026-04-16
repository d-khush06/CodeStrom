"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, ShieldCheck, Sparkles, UserCircle2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";

const glassCard =
  "rounded-3xl border backdrop-blur-xl transition-all " +
  "bg-white/60 border-slate-200 shadow-sm " +
  "dark:bg-white/[0.02] dark:border-white/10 dark:shadow-none";

const glowHover =
  "hover:shadow-[0_18px_60px_-18px_rgba(37,99,235,0.35)] " +
  "dark:hover:shadow-[0_18px_60px_-18px_rgba(37,99,235,0.55)]";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  const name = user?.firstName || user?.username || user?.fullName || "there";
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "-";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/30 dark:bg-[#0A0A0B] dark:text-white">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6"
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.24em] text-slate-900/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white"
        >
          DASHBOARD
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.1 }}
        className="mx-auto w-full max-w-6xl px-6 pb-16"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Top row: Large greeting bento */}
          <motion.section
            whileHover={{ scale: 1.01 }}
            className={
              "lg:col-span-8 " + glassCard + " " + glowHover +
              " p-8"
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Welcome
                </p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                  Hey{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                    {isLoaded ? name : "..."}
                  </span>
                  .
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Your premium cyber workspace is live. Jump into quick actions below or head back
                  to the landing page.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-200 dark:shadow-none">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-cyan-300" />
                Online
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={"rounded-2xl border p-4 backdrop-blur-xl " + "bg-white/60 border-slate-200 shadow-sm dark:bg-white/[0.02] dark:border-white/10 dark:shadow-none"}>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Email
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {isLoaded ? email : "-"}
                </p>
              </div>

              <div className={"rounded-2xl border p-4 backdrop-blur-xl " + "bg-white/60 border-slate-200 shadow-sm dark:bg-white/[0.02] dark:border-white/10 dark:shadow-none"}>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Profile
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <UserCircle2 className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                  {isLoaded ? (user?.fullName || user?.username || "User") : "User"}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Top row: Secondary bento */}
          <motion.aside
            whileHover={{ scale: 1.01 }}
            className={
              "lg:col-span-4 " + glassCard + " " + glowHover +
              " p-8"
            }
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Workspace
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
              CodeStorm HQ
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Protected routes, Clerk auth, and cyber glass UI — ready for judging.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-200 dark:shadow-none">
                <span className="font-semibold">Plan</span>
                <span className="text-slate-500 dark:text-slate-400">Neon Pro</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-200 dark:shadow-none">
                <span className="font-semibold">Security</span>
                <span className="text-slate-500 dark:text-slate-400">2FA enabled</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-200 dark:shadow-none">
                <span className="font-semibold">Status</span>
                <span className="text-slate-500 dark:text-slate-400">Active</span>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Bottom row: 3 quick-action cards */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
          }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {[{
            title: "Launch project",
            body: "Start your first build with a polished, animated UI.",
            icon: Rocket,
            href: "/",
          },
          {
            title: "Security check",
            body: "Review sessions and devices for your account.",
            icon: ShieldCheck,
            href: "/dashboard",
          },
          {
            title: "Glow settings",
            body: "Toggle theme and refine the cyber glass look.",
            icon: Sparkles,
            href: "/dashboard",
          }].map(({ title, body, icon: Icon, href }) => (
            <motion.div
              key={title}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 18 } },
              }}
              whileHover={{ scale: 1.01 }}
              className={glassCard + " " + glowHover + " p-6"}
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{body}</p>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href={href}
                  className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                >
                  Open
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.section>
      </motion.main>
    </div>
  );
}
