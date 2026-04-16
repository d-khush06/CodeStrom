"use client";

import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";

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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/30 font-sans pb-24 dark:bg-[#0A0A0B] dark:text-white">
      
      {/* Top Navigation Bar - Fades in instantly */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full"
      >
        <div className="font-bold text-xl tracking-widest">CODESTORM</div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          
          <Show when="signed-in">
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white">
              Dashboard
            </Link>
            <ProfileMenu />
          </Show>
          
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white"
            >
              Sign in
            </Link>
          </Show>
        </div>
      </motion.nav>

      <main className="flex flex-col items-center justify-center mt-20 px-4 text-center max-w-5xl mx-auto w-full">
        
        {/* Hero Section - Slides up smoothly */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="bg-white/80 border border-slate-200 rounded-full px-5 py-2 mb-8 text-xs font-medium text-slate-600 backdrop-blur-md flex items-center dark:bg-white/5 dark:border-white/10 dark:text-slate-300">
            Secure authentication <span className="mx-3 text-slate-600">•</span> Glassmorphism UI
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            The ultra-modern starter <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              for premium dark apps
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed dark:text-slate-400">
            Dark glass surfaces, neon edges, and crisp typography. Ship authentication, dashboards, 
            and protected routes with a cyber-polished aesthetic.
          </p>

          <Show when="signed-in">
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
              Go to dashboard
            </Link>
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
            >
              Get Started
            </Link>
          </Show>
        </motion.div>

        {/* 3-Column Feature Cards - Staggered Pop-in */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl text-left"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="group bg-white border border-slate-200 rounded-2xl p-8 backdrop-blur-xl hover:bg-slate-50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.2)] dark:bg-white/[0.02] dark:border-white/10 dark:hover:bg-white/[0.06] dark:hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.3)]">
            <h3 className="font-semibold text-lg mb-2 text-slate-900 group-hover:text-cyan-600 transition-colors duration-300 dark:text-white dark:group-hover:text-cyan-400">Frosted surfaces</h3>
            <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400">Ultra-soft glass layers with subtle neon glow edges.</p>
          </motion.div>
          
          {/* Card 2 */}
          <motion.div variants={itemVariants} className="group bg-white border border-slate-200 rounded-2xl p-8 backdrop-blur-xl hover:bg-slate-50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.2)] dark:bg-white/[0.02] dark:border-white/10 dark:hover:bg-white/[0.06] dark:hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.3)]">
            <h3 className="font-semibold text-lg mb-2 text-slate-900 group-hover:text-blue-600 transition-colors duration-300 dark:text-white dark:group-hover:text-blue-400">Protected routes</h3>
            <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400">Middleware + auth-ready pages with modern UX patterns.</p>
          </motion.div>
          
          {/* Card 3 */}
          <motion.div variants={itemVariants} className="group bg-white border border-slate-200 rounded-2xl p-8 backdrop-blur-xl hover:bg-slate-50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.2)] dark:bg-white/[0.02] dark:border-white/10 dark:hover:bg-white/[0.06] dark:hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.3)]">
            <h3 className="font-semibold text-lg mb-2 text-slate-900 group-hover:text-purple-600 transition-colors duration-300 dark:text-white dark:group-hover:text-purple-400">Premium polish</h3>
            <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400">Bold typography, high contrast, and cyber accents.</p>
          </motion.div>
        </motion.div>

      </main>
    </div>
  );
}