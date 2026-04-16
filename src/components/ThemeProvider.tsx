"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

function ThemeAttributeSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!resolvedTheme) return;

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeAttributeSync />
      {children}
    </NextThemesProvider>
  );
}
