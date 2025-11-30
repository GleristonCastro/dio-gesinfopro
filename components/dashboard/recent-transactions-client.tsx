"use client";

import { TransactionCard } from "@/components/transactions/transaction-card";
import { ArrowDownIcon, ArrowUpIcon, PiggyBank } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  description: string;
  date: Date;
  goalId: string | null;
  category: {
    name: string;
  } | null;
}

interface RecentTransactionsClientProps {
  transactions: Transaction[];
}

export function RecentTransactionsClient({
  transactions,
}: RecentTransactionsClientProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Nenhuma transação ainda. Use o chat ao lado para registrar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isReserve = !!(
          transaction.type === "EXPENSE" && transaction.goalId
        );
        const isIncome = transaction.type === "INCOME";

        const icon = isIncome
          ? ArrowUpIcon
          : isReserve
          ? PiggyBank
          : ArrowDownIcon;

        return (
          <TransactionCard
            key={transaction.id}
            id={transaction.id}
            description={transaction.description}
            amount={Number(transaction.amount)}
            type={transaction.type}
            date={transaction.date}
            category={transaction.category?.name}
            icon={icon}
            isReserve={isReserve}
          />
        );
      })}
    </div>
  );
}
