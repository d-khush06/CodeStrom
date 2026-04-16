"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, Settings, ChevronDown } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";

export function ProfileMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }

    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const name = user?.fullName || user?.firstName || user?.username || "User";
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_10px_30px_rgba(0,0,0,0.45)] dark:hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-white dark:border-white/10 dark:bg-white/10">
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
        <span className="hidden sm:block">{isLoaded ? name : "Account"}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div
          className="absolute right-0 z-30 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-[#18181B] dark:text-white"
          role="menu"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 dark:border-white/10">
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
            <div>
              <p className="text-sm font-semibold">{isLoaded ? name : "Account"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isLoaded ? email : ""}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 px-2 py-2">
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-white"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Manage account
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-white"
              role="menuitem"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="h-4 w-4 text-slate-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
