import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkCleanup } from "./_components/ClerkCleanup";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeStorm Solution",
  description: "Hackathon build",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={
          inter.className +
          " min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/30 " +
          "dark:bg-[#0A0A0B] dark:text-white"
        }
      >
        <ThemeProvider>
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: "#2563eb",
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
                  "rounded-full bg-blue-600 hover:bg-blue-500 text-white " +
                  "shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]",
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