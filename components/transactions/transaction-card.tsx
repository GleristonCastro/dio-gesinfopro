"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TransactionCardProps {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: Date;
  category?: string;
  icon: LucideIcon;
  isReserve?: boolean;
  onClick?: () => void;
  className?: string;
}

const typeStyles = {
  INCOME: {
    bg: "bg-linear-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80",
    iconBg: "bg-green-500/10 dark:bg-green-500/20",
    iconColor: "text-green-600 dark:text-green-400",
    amountColor: "text-green-600 dark:text-green-400",
    border: "border-white/20 dark:border-gray-800/50",
    sign: "+",
  },
  EXPENSE: {
    bg: "bg-linear-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80",
    iconBg: "bg-red-500/10 dark:bg-red-500/20",
    iconColor: "text-red-600 dark:text-red-400",
    amountColor: "text-red-600 dark:text-red-400",
    border: "border-white/20 dark:border-gray-800/50",
    sign: "-",
  },
  RESERVE: {
    bg: "bg-linear-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    amountColor: "text-blue-600 dark:text-blue-400",
    border: "border-white/20 dark:border-gray-800/50",
    sign: "-",
  },
};

export function TransactionCard({
  id,
  description,
  amount,
  type,
  date,
  category,
  icon: Icon,
  isReserve = false,
  onClick,
  className,
}: TransactionCardProps) {
  const styleType = isReserve ? "RESERVE" : type;
  const styles = typeStyles[styleType];

  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);

  const formattedDate = new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Card
      className={cn(
        "group relative overflow-hidden",
        styles.border,
        styles.bg,
        "backdrop-blur-xl shadow-lg hover:shadow-xl",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:shadow-2xl hover:-translate-y-0.5",
        "animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4 p-4">
        {/* Icon & Description */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              styles.iconBg,
              "transition-transform duration-300 group-hover:scale-110"
            )}
          >
            <Icon
              className={cn("h-5 w-5", styles.iconColor)}
              aria-hidden="true"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {category && (
                <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                  {category}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className={cn("text-lg font-bold", styles.amountColor)}>
            {styles.sign}
            {formattedAmount}
          </p>
          {isReserve && (
            <Badge variant="info" className="text-xs mt-1">
              Reserva
            </Badge>
          )}
        </div>
      </div>

      {/* Hover effect gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
    </Card>
  );
}
