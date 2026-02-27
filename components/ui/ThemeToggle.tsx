"use client";
// ============================================================
//  components/ui/ThemeToggle.tsx
//  Botón dark/light con next-themes
// ============================================================

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md",
        "text-neutral-500 dark:text-neutral-400",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "transition-colors"
      )}
      aria-label="Cambiar tema"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
