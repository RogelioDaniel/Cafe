"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Canonical next-themes mounted guard to avoid hydration mismatch.
  // The set-state-in-effect rule doesn't apply here: this synchronizes
  // with an external system (the DOM theme attribute set by next-themes).
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-11 w-11 text-[#1d2059]" aria-label="Cambiar tema">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-11 w-11 cursor-pointer text-[#1d2059] hover:bg-[#fff8d8]/60"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#f3df4d]" />
      ) : (
        <Moon className="h-4 w-4 text-[#1d2059]" />
      )}
    </Button>
  );
}
