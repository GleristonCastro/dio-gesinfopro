"use client";

import { useState, useEffect } from "react";
import { ModernTransactions } from "@/components/transactions/modern-transactions";
import { StatCard } from "@/components/ui/stat-card";
import { ArrowUpIcon, ArrowDownIcon, PiggyBank, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: Date;
  categoryId: string | null;
  goalId: string | null;
  category?: string;
  goal?: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Stats {
  totalIncome: number;
  totalExpenses: number;
  totalReserves: number;
  balance: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpenses: 0,
    totalReserves: 0,
    balance: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, catRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories"),
      ]);

      const transData = await transRes.json();
      const catData = await catRes.json();

      // Converter dates de string para Date e amount para number
      const transactionsWithDates = transData.map((t: any) => ({
        ...t,
        date: new Date(t.date),
        amount: typeof t.amount === "number" ? t.amount : Number(t.amount),
        category: t.category?.name || undefined,
      }));

      setTransactions(transactionsWithDates);
      setCategories(catData);

      // Calcular estatísticas usando os dados já convertidos
      const income = transactionsWithDates
        .filter((t: Transaction) => t.type === "INCOME")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const expenses = transactionsWithDates
        .filter((t: Transaction) => t.type === "EXPENSE" && !t.goalId)
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const reserves = transactionsWithDates
        .filter((t: Transaction) => t.type === "EXPENSE" && t.goalId)
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        totalReserves: reserves,
        balance: income - expenses - reserves,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6 animate-in fade-in-50 duration-500">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Stats Skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Transactions Skeleton */}
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Transações
        </h1>
        <p className="text-muted-foreground">
          Gerencie todas as suas movimentações financeiras
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receitas"
          value={stats.totalIncome}
          description="Total de entradas"
          icon={ArrowUpIcon}
          color="green"
          animated
        />
        <StatCard
          title="Despesas"
          value={stats.totalExpenses}
          description="Total de saídas"
          icon={ArrowDownIcon}
          color="red"
          animated
        />
        <StatCard
          title="Reservas"
          value={stats.totalReserves}
          description="Guardado em metas"
          icon={PiggyBank}
          color="blue"
          animated
        />
        <StatCard
          title="Saldo Líquido"
          value={stats.balance}
          description="Receitas - Gastos"
          icon={Wallet}
          color="purple"
          animated
        />
      </div>

      {/* Transactions List */}
      <ModernTransactions transactions={transactions} />
    </div>
  );
}
