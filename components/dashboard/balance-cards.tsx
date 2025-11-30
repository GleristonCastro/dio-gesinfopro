"use client";

import { StatCard } from "@/components/ui/stat-card";
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from "lucide-react";

interface BalanceCardsProps {
  totalIncome: number;
  totalExpense: number;
  totalReserved: number;
  balance: number;
}

export function BalanceCards({
  totalIncome,
  totalExpense,
  totalReserved,
  balance,
}: BalanceCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 w-full">
      {/* Receitas */}
      <StatCard
        title="Receitas"
        value={totalIncome}
        icon={TrendingUp}
        color="green"
        format="currency"
        description="Total de receitas no período"
        animated
      />

      {/* Despesas */}
      <StatCard
        title="Despesas"
        value={totalExpense}
        icon={TrendingDown}
        color="red"
        format="currency"
        description="Total de gastos no período"
        animated
      />

      {/* Reservas */}
      <StatCard
        title="Reservas"
        value={totalReserved}
        icon={PiggyBank}
        color="blue"
        format="currency"
        description="Total reservado em metas"
        animated
      />

      {/* Saldo */}
      <StatCard
        title="Saldo"
        value={balance}
        icon={Wallet}
        color={balance >= 0 ? "green" : "red"}
        format="currency"
        description="Saldo disponível"
        animated
      />
    </div>
  );
}
