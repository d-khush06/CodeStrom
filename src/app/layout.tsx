import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkCleanup } from "./_components/ClerkCleanup";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "CodeStorm Solution",
  description: "Hackathon build",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={
          spaceGrotesk.className +
          " " +
          spaceGrotesk.variable +
          " " +
          plexMono.variable +
          " min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-400/30 " +
          "dark:bg-[#0A0A0B] dark:text-white"
        }
      >
        <ThemeProvider>
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: "#22d3ee",
              },
              elements: {
                userButtonPopoverFooter: "hidden",
                footer: "hidden",
                footerPages: "hidden",
                badge: "hidden",

                modalBackdrop: "backdrop-blur-sm bg-black/55 dark:bg-black/65",
                modalContent: "bg-transparent shadow-none",
                card:
                  "rounded-3xl border backdrop-blur-xl " +
                  "bg-white/60 border-slate-200 shadow-sm " +
                  "dark:bg-white/[0.02] dark:border-white/10 dark:shadow-none",

                navbar: "bg-transparent",
                navbarButton:
                  "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                headerTitle: "text-slate-900 dark:text-white",
                headerSubtitle: "text-slate-500 dark:text-slate-400",

                formButtonPrimary:
                  "rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 " +
                  "shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]",
              },
            }}
          >
            <ClerkCleanup />
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}