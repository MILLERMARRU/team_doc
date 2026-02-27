"use client";
// ============================================================
//  components/Providers.tsx
//  Wrapper de providers del cliente (next-themes)
// ============================================================

import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
