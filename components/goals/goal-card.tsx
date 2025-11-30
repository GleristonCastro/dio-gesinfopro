"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LucideIcon,
  Target,
  Trophy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Receipt,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface GoalCardProps {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date | null;
  status?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  showConfetti?: boolean;
  transactions?: {
    id: string;
    amount: number;
    description: string;
    date: Date | string;
  }[];
  showTransactions?: boolean;
}

const getProgressColor = (progress: number) => {
  if (progress >= 100) {
    return {
      bg: "bg-linear-to-br from-green-500/10 to-emerald-500/5 dark:from-green-500/20 dark:to-emerald-500/10",
      border: "border-l-green-500 border-y-0 border-r-0",
      iconBg: "bg-green-500/10 dark:bg-green-500/20",
      iconColor: "text-green-600 dark:text-green-400",
      progressBar: "bg-green-500",
      text: "text-green-600 dark:text-green-400",
    };
  } else if (progress >= 75) {
    return {
      bg: "bg-linear-to-br from-blue-500/10 to-cyan-500/5 dark:from-blue-500/20 dark:to-cyan-500/10",
      border: "border-l-blue-500 border-y-0 border-r-0",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      progressBar: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
    };
  } else if (progress >= 50) {
    return {
      bg: "bg-linear-to-br from-orange-500/10 to-yellow-500/5 dark:from-orange-500/20 dark:to-yellow-500/10",
      border: "border-l-orange-500 border-y-0 border-r-0",
      iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      progressBar: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
    };
  } else if (progress >= 25) {
    return {
      bg: "bg-linear-to-br from-purple-500/10 to-pink-500/5 dark:from-purple-500/20 dark:to-pink-500/10",
      border: "border-l-purple-500 border-y-0 border-r-0",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      progressBar: "bg-purple-500",
      text: "text-purple-600 dark:text-purple-400",
    };
  } else {
    return {
      bg: "bg-linear-to-br from-gray-500/10 to-slate-500/5 dark:from-gray-500/20 dark:to-slate-500/10",
      border: "border-l-gray-500 border-y-0 border-r-0",
      iconBg: "bg-gray-500/10 dark:bg-gray-500/20",
      iconColor: "text-gray-600 dark:text-gray-400",
      progressBar: "bg-gray-500",
      text: "text-gray-600 dark:text-gray-400",
    };
  }
};

export function GoalCard({
  id,
  name,
  targetAmount,
  currentAmount,
  deadline,
  status,
  icon: Icon = Target,
  onClick,
  className,
  showConfetti = false,
  transactions = [],
  showTransactions = false,
}: GoalCardProps) {
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isCompleted = progress >= 100;
  const colors = getProgressColor(progress);
  const hasPlayedConfetti = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Dispara confetti quando a meta atinge 100%
  useEffect(() => {
    if (isCompleted && !hasPlayedConfetti.current) {
      hasPlayedConfetti.current = true;

      // Confetti explosion
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      // Dispara múltiplas explosões para um efeito mais dramático
      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isCompleted]);

  const daysLeft = deadline
    ? Math.ceil(
        (new Date(deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const isOverdue = daysLeft !== null && daysLeft < 0;

  const formattedCurrent = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(currentAmount);

  const formattedTarget = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(targetAmount);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1",
        onClick && "cursor-pointer",
        "animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
        className
      )}
      onClick={onClick}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                colors.iconBg,
                "transition-transform duration-300 group-hover:scale-110"
              )}
            >
              {isCompleted ? (
                <Trophy className={cn("h-6 w-6", colors.iconColor)} />
              ) : (
                <Icon className={cn("h-6 w-6", colors.iconColor)} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground truncate">
                {name}
              </h3>
              {daysLeft !== null && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      isOverdue
                        ? "danger"
                        : daysLeft <= 7
                        ? "warning"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {isOverdue
                      ? `${Math.abs(daysLeft)} dias atrasado`
                      : daysLeft === 0
                      ? "Hoje!"
                      : daysLeft === 1
                      ? "1 dia restante"
                      : `${daysLeft} dias restantes`}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {isCompleted && (
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="relative">
            <Progress
              value={Math.min(progress, 100)}
              className="h-3"
              indicatorClassName={cn(
                colors.progressBar,
                "transition-all duration-500 ease-out"
              )}
            />
            {isCompleted && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>

          {/* Progress Stats */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Progresso</p>
              <p className={cn("text-2xl font-bold", colors.text)}>
                <CountUp
                  end={Math.min(progress, 100)}
                  duration={1.5}
                  decimals={0}
                  suffix="%"
                  preserveValue
                />
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Valor</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-foreground">
                  {formattedCurrent}
                </span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs text-muted-foreground">
                  {formattedTarget}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {isCompleted && (
            <div className="pt-2 border-t">
              <Badge variant="success" className="w-full justify-center">
                🎉 Meta Concluída!
              </Badge>
            </div>
          )}
        </div>

        {/* Transações (se showTransactions estiver ativo) */}
        {showTransactions && transactions.length > 0 && (
          <div className="pt-4 border-t">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span>
                  {transactions.length}{" "}
                  {transactions.length === 1 ? "reserva" : "reservas"}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {transactions.map((transaction) => {
                  const transactionDate =
                    typeof transaction.date === "string"
                      ? new Date(transaction.date)
                      : transaction.date;

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(transactionDate, "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <div className="ml-3 font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(transaction.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
    </Card>
  );
}
