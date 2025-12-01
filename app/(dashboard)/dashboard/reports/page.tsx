"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  Wallet,
  PieChartIcon,
  Percent,
} from "lucide-react";
import { FinancialInsights } from "@/components/reports/financial-insights";

interface ReportData {
  balanceEvolution: Array<{
    month: string;
    balance: number;
    income: number;
    expense: number;
    reserved: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
  incomeVsExpense: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  metrics: {
    totalIncome: number;
    totalExpense: number;
    totalReserved: number;
    currentBalance: number;
    largestExpense: {
      amount: number;
      description: string;
      category: string;
    } | null;
    topCategory: {
      name: string;
      value: number;
    } | null;
    savingsRate: number;
  };
}

const COLORS = [
  "#10b981", // green-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(3); // meses

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?months=${period}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-24" />
            <Skeleton className="h-11 w-24" />
            <Skeleton className="h-11 w-24" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>

        {/* StatCards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        {/* Insights Skeleton */}
        <Skeleton className="h-48" />

        {/* Charts Skeleton */}
        <Skeleton className="h-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Erro ao carregar relatórios</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com gradiente moderno */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Relatórios Financeiros
          </h1>
          <p className="text-muted-foreground">
            Análise detalhada e insights inteligentes
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant={period === 1 ? "default" : "outline"}
            onClick={() => setPeriod(1)}
            size="sm"
            className="flex-1 sm:flex-none bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/70 backdrop-blur-sm hover:shadow-md transition-all"
          >
            Mês atual
          </Button>
          <Button
            variant={period === 3 ? "default" : "outline"}
            onClick={() => setPeriod(3)}
            size="sm"
            className="flex-1 sm:flex-none bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/70 backdrop-blur-sm hover:shadow-md transition-all"
          >
            3 meses
          </Button>
          <Button
            variant={period === 6 ? "default" : "outline"}
            onClick={() => setPeriod(6)}
            size="sm"
            className="flex-1 sm:flex-none bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/70 backdrop-blur-sm hover:shadow-md transition-all"
          >
            6 meses
          </Button>
          <Button
            variant={period === 12 ? "default" : "outline"}
            onClick={() => setPeriod(12)}
            size="sm"
            className="flex-1 sm:flex-none bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/70 backdrop-blur-sm hover:shadow-md transition-all"
          >
            Ano
          </Button>
        </div>
      </div>

      {/* StatCards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Receitas"
          value={data.metrics.totalIncome}
          icon={TrendingUp}
          color="green"
          format="currency"
          description="No período selecionado"
        />
        <StatCard
          title="Total de Despesas"
          value={data.metrics.totalExpense}
          icon={TrendingDown}
          color="red"
          format="currency"
          description="No período selecionado"
        />
        <StatCard
          title="Taxa de Economia"
          value={data.metrics.savingsRate}
          icon={Percent}
          color="purple"
          format="percent"
          description="Do que você recebeu"
        />
        <StatCard
          title="Saldo Atual"
          value={data.metrics.currentBalance}
          icon={Wallet}
          color="blue"
          format="currency"
          description="Seu saldo disponível"
        />
      </div>

      {/* Insights Financeiros */}
      <FinancialInsights months={period} />

      {/* Gráfico de evolução do saldo */}
      <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl dark:bg-linear-to-br dark:from-gray-900/90 dark:to-gray-950/80 dark:backdrop-blur-xl dark:border-gray-800/50 dark:shadow-2xl dark:hover:shadow-3xl transition-all duration-300">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800/50 bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-500/20 dark:to-cyan-500/20">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Evolução do Saldo
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.balanceEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Saldo"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receitas vs Despesas */}
        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl dark:bg-linear-to-br dark:from-gray-900/90 dark:to-gray-950/80 dark:backdrop-blur-xl dark:border-gray-800/50 dark:shadow-2xl dark:hover:shadow-3xl transition-all duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800/50 bg-linear-to-r from-green-50 to-red-50 dark:from-green-500/20 dark:to-red-500/20">
            <CardTitle className="bg-gradient-to-r from-green-600 to-red-600 dark:from-green-400 dark:to-red-400 bg-clip-text text-transparent">
              Receitas vs Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Receitas" />
                <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl dark:bg-linear-to-br dark:from-gray-900/90 dark:to-gray-950/80 dark:backdrop-blur-xl dark:border-gray-800/50 dark:shadow-2xl dark:hover:shadow-3xl transition-all duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800/50 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-500/20 dark:to-pink-500/20">
            <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "#000" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
