"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";

interface Badge {
  value: number;
  positive: boolean;
  label?: string;
}

export interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "green" | "red" | "blue" | "orange" | "purple";
  badge?: Badge;
  format?: "currency" | "number" | "percent";
  description?: string;
  className?: string;
  animated?: boolean;
}

const colorClasses = {
  green: {
    bg: "bg-linear-to-br from-green-500/10 to-emerald-500/5",
    icon: "text-green-600 dark:text-green-400",
    border: "border-l-green-500",
    iconBg: "bg-green-500/10",
  },
  red: {
    bg: "bg-linear-to-br from-red-500/10 to-rose-500/5",
    icon: "text-red-600 dark:text-red-400",
    border: "border-l-red-500",
    iconBg: "bg-red-500/10",
  },
  blue: {
    bg: "bg-linear-to-br from-blue-500/10 to-cyan-500/5",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-l-blue-500",
    iconBg: "bg-blue-500/10",
  },
  orange: {
    bg: "bg-linear-to-br from-orange-500/10 to-amber-500/5",
    icon: "text-orange-600 dark:text-orange-400",
    border: "border-l-orange-500",
    iconBg: "bg-orange-500/10",
  },
  purple: {
    bg: "bg-linear-to-br from-purple-500/10 to-violet-500/5",
    icon: "text-purple-600 dark:text-purple-400",
    border: "border-l-purple-500",
    iconBg: "bg-purple-500/10",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  badge,
  format = "currency",
  description,
  className,
  animated = true,
}: StatCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(val);
      case "percent":
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString("pt-BR");
    }
  };

  const colors = colorClasses[color];

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 group cursor-default",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-white/20 dark:border-gray-800/50 bg-gradient-to-r from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-lg transition-transform group-hover:scale-110 backdrop-blur-sm",
            colors.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-2">
          {/* Valor Principal */}
          <div className="text-2xl font-bold tracking-tight">
            {animated ? (
              <CountUp
                end={value}
                decimals={
                  format === "currency" ? 2 : format === "percent" ? 1 : 0
                }
                duration={2}
                preserveValue
                separator="."
                decimal=","
                prefix={format === "currency" ? "R$ " : ""}
                suffix={format === "percent" ? "%" : ""}
              />
            ) : (
              formatValue(value)
            )}
          </div>

          {/* Badge de Variação */}
          {badge && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  badge.positive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {badge.positive ? "↑" : "↓"} {Math.abs(badge.value).toFixed(2)}%
              </span>
              {badge.label && (
                <span className="text-xs text-muted-foreground">
                  {badge.label}
                </span>
              )}
            </div>
          )}

          {/* Descrição */}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
