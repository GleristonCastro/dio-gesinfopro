"use client";

import React, { useState, useMemo } from "react";
import { TransactionCard } from "./transaction-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PiggyBank,
  Search,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: Date;
  category?: string;
  goalId?: string | null;
}

interface ModernTransactionsProps {
  transactions: Transaction[];
  className?: string;
}

type FilterType = "ALL" | "INCOME" | "EXPENSE" | "RESERVE";

export function ModernTransactions({
  transactions,
  className,
}: ModernTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        transaction.category
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      // Type filter
      const isReserve = transaction.type === "EXPENSE" && transaction.goalId;
      let matchesType = true;

      if (filterType === "INCOME") {
        matchesType = transaction.type === "INCOME";
      } else if (filterType === "EXPENSE") {
        matchesType = transaction.type === "EXPENSE" && !transaction.goalId;
      } else if (filterType === "RESERVE") {
        matchesType = isReserve;
      }

      return matchesSearch && matchesType;
    });
  }, [transactions, debouncedSearch, filterType]);

  const stats = useMemo(() => {
    return {
      total: transactions.length,
      income: transactions.filter((t) => t.type === "INCOME").length,
      expense: transactions.filter((t) => t.type === "EXPENSE" && !t.goalId)
        .length,
      reserve: transactions.filter((t) => t.type === "EXPENSE" && t.goalId)
        .length,
    };
  }, [transactions]);

  const getIcon = (transaction: Transaction) => {
    const isReserve = transaction.type === "EXPENSE" && transaction.goalId;
    if (transaction.type === "INCOME") return ArrowUpIcon;
    if (isReserve) return PiggyBank;
    return ArrowDownIcon;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-white border-gray-300 dark:bg-gray-800/50 dark:border-gray-700/50 dark:backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setFilterType("ALL")}
            className={cn(
              "transition-all duration-200 rounded-full",
              filterType === "ALL"
                ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl px-4 py-1.5 text-sm font-medium"
                : "bg-white text-gray-700 border border-gray-300 dark:bg-gray-800/50 dark:text-gray-200 dark:border-gray-700/50 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-800/70 px-4 py-1.5 text-sm font-medium"
            )}
          >
            Todas ({stats.total})
          </button>
          <button
            onClick={() => setFilterType("INCOME")}
            className={cn(
              "transition-all duration-200 rounded-full",
              filterType === "INCOME"
                ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl px-4 py-1.5 text-sm font-medium"
                : "bg-white text-gray-700 border border-gray-300 dark:bg-gray-800/50 dark:text-gray-200 dark:border-gray-700/50 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-800/70 px-4 py-1.5 text-sm font-medium"
            )}
          >
            Receitas ({stats.income})
          </button>
          <button
            onClick={() => setFilterType("EXPENSE")}
            className={cn(
              "transition-all duration-200 rounded-full",
              filterType === "EXPENSE"
                ? "bg-linear-to-r from-red-600 to-rose-600 text-white shadow-lg hover:shadow-xl px-4 py-1.5 text-sm font-medium"
                : "bg-white text-gray-700 border border-gray-300 dark:bg-gray-800/50 dark:text-gray-200 dark:border-gray-700/50 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-800/70 px-4 py-1.5 text-sm font-medium"
            )}
          >
            Despesas ({stats.expense})
          </button>
          <button
            onClick={() => setFilterType("RESERVE")}
            className={cn(
              "transition-all duration-200 rounded-full",
              filterType === "RESERVE"
                ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl px-4 py-1.5 text-sm font-medium"
                : "bg-white text-gray-700 border border-gray-300 dark:bg-gray-800/50 dark:text-gray-200 dark:border-gray-700/50 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-800/70 px-4 py-1.5 text-sm font-medium"
            )}
          >
            Reservas ({stats.reserve})
          </button>
        </div>
      </div>

      {/* Results Count */}
      {debouncedSearch && (
        <p className="text-sm text-muted-foreground">
          {filteredTransactions.length} resultado
          {filteredTransactions.length !== 1 ? "s" : ""} encontrado
          {filteredTransactions.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="overflow-hidden bg-white border border-gray-200 shadow-lg dark:bg-linear-to-br dark:from-gray-900/90 dark:to-gray-950/80 dark:backdrop-blur-xl dark:border-gray-800/50 dark:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 dark:border-gray-800/50 bg-linear-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Nenhuma transação encontrada
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const isReserve =
                      transaction.type === "EXPENSE" && transaction.goalId;
                    const isIncome = transaction.type === "INCOME";
                    const Icon = getIcon(transaction);

                    const typeColors = isIncome
                      ? "text-green-600 dark:text-green-400 bg-green-500/10"
                      : isReserve
                      ? "text-blue-600 dark:text-blue-400 bg-blue-500/10"
                      : "text-red-600 dark:text-red-400 bg-red-500/10";

                    const amountColor = isIncome
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400";

                    return (
                      <tr
                        key={transaction.id}
                        className="group hover:bg-linear-to-r hover:from-blue-500/5 hover:via-purple-500/5 hover:to-pink-500/5 transition-all duration-200 border-b border-white/10 dark:border-gray-800/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                typeColors,
                                "transition-transform group-hover:scale-110"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-sm">
                              {transaction.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {transaction.category ? (
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Sem categoria
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              isIncome
                                ? "success"
                                : isReserve
                                ? "info"
                                : "danger"
                            }
                            className="text-xs"
                          >
                            {isIncome
                              ? "Receita"
                              : isReserve
                              ? "Reserva"
                              : "Despesa"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn("font-bold text-sm", amountColor)}
                          >
                            {isIncome ? "+" : "-"}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(transaction.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-gray-200 shadow-lg dark:bg-linear-to-br dark:from-gray-900/90 dark:to-gray-950/80 dark:backdrop-blur-xl dark:border-gray-800/50">
            <p className="text-sm text-muted-foreground">
              Nenhuma transação encontrada
            </p>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => {
            const isReserve =
              transaction.type === "EXPENSE" && transaction.goalId;
            const Icon = getIcon(transaction);

            return (
              <TransactionCard
                key={transaction.id}
                id={transaction.id}
                description={transaction.description}
                amount={transaction.amount}
                type={transaction.type}
                date={transaction.date}
                category={transaction.category}
                icon={Icon}
                isReserve={isReserve}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
