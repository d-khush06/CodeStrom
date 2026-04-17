"use client";

import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { AnalysisDashboard } from "./_components/AnalysisDashboard";

export default function Home() {
  // These are your "Keyframes" for the staggered card animation
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120 },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-[var(--app-fg)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.35),_transparent_70%)] blur-2xl" />
        <div className="absolute right-[-15%] top-[10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.25),_transparent_65%)] blur-2xl" />
        <div className="absolute bottom-[-25%] left-[25%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.22),_transparent_70%)] blur-2xl" />
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full"
      >
        <div className="font-bold text-lg tracking-[0.4em] text-white">CODESTORM</div>
        <div className="flex items-center gap-6">
          <ThemeToggle />

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <ProfileMenu />
          </Show>

          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </Show>
        </div>
      </motion.nav>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-6 pb-20">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/70">
              Video intelligence · correlation · insights
            </div>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
              Video transcript analysis
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300">
                built for real-world signals
              </span>
            </h1>
            <p className="mt-5 text-lg text-white/70">
              Upload a video, extract metadata, align transcript segments, and surface
              timeline insights in minutes. The dashboard below is wired end-to-end for
              hackathon demos.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="#analysis-dashboard"
                className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              >
                Start demo
              </Link>
              <button className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.25em] text-white/70 hover:border-white/40">
                View pipeline
              </button>
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4">
            {[
              {
                title: "Metadata + scene extraction",
                text: "Capture duration, bitrate, and scene boundaries with deterministic alignment.",
              },
              {
                title: "Behavioral signal plotting",
                text: "Track speaking pace, pauses, and sentiment arcs across the timeline.",
              },
              {
                title: "Actionable insights",
                text: "Summarize real-world implications with evidence-backed reasoning.",
              },
            ].map((card, index) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
              >
                <div className="text-xs uppercase tracking-[0.24em] text-white/50">
                  Module {index + 1}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm text-white/60">{card.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <AnalysisDashboard />
      </main>
    </div>
  );
}