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
      <div className="grid grid-cols-3 gap-3">
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  const themes = [
    {
      value: "light",
      label: "Claro",
      icon: Sun,
      preview: "bg-linear-to-br from-blue-50 to-indigo-50",
      description: "Tema claro e limpo",
    },
    {
      value: "dark",
      label: "Escuro",
      icon: Moon,
      preview: "bg-linear-to-br from-slate-900 to-slate-800",
      description: "Tema escuro para os olhos",
    },
    {
      value: "system",
      label: "Sistema",
      icon: Monitor,
      preview: "bg-linear-to-br from-blue-50 via-slate-500 to-slate-900",
      description: "Sincroniza com o sistema",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {themes.map(({ value, label, icon: Icon, preview, description }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
          aria-label={`Selecionar tema ${label}`}
          className={`
            relative flex flex-col items-center gap-3 p-4 rounded-lg border transition-all duration-300
            hover:scale-105
            ${
              theme === value
                ? "bg-gradient-to-br from-blue-500/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-500/20 border-blue-500/30 dark:border-blue-500/50 shadow-lg backdrop-blur-sm"
                : "bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 hover:border-blue-500/30 dark:hover:border-blue-500/50 backdrop-blur-sm hover:shadow-md"
            }
          `}
        >
          {/* Preview visual do tema */}
          <div
            className={`w-full h-12 rounded-md ${preview} border border-gray-200 dark:border-gray-700`}
          />

          {/* Ícone e label */}
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${
                theme === value ? "text-primary" : "text-muted-foreground"
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-sm font-medium ${
                theme === value ? "text-primary" : ""
              }`}
            >
              {label}
            </span>
          </div>

          {/* Indicador de selecionado */}
          {theme === value && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
