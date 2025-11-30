"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }

  const themes = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <div className="flex gap-2">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
          aria-label={`Selecionar tema ${label}`}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
            ${
              theme === value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
            }
          `}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
