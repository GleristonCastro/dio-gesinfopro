"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  PieChartIcon,
  Percent,
  Loader2,
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Relatórios</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Análise financeira detalhada
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant={period === 1 ? "default" : "outline"}
            onClick={() => setPeriod(1)}
            className="min-h-11 flex-1 sm:flex-none"
          >
            Mês atual
          </Button>
          <Button
            variant={period === 3 ? "default" : "outline"}
            onClick={() => setPeriod(3)}
            className="min-h-11 flex-1 sm:flex-none"
          >
            3 meses
          </Button>
          <Button
            variant={period === 6 ? "default" : "outline"}
            onClick={() => setPeriod(6)}
            className="min-h-11 flex-1 sm:flex-none"
          >
            6 meses
          </Button>
          <Button
            variant={period === 12 ? "default" : "outline"}
            onClick={() => setPeriod(12)}
            className="min-h-11 flex-1 sm:flex-none"
          >
            Ano
          </Button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Despesa</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.metrics.largestExpense
                ? formatCurrency(data.metrics.largestExpense.amount)
                : "N/A"}
            </div>
            {data.metrics.largestExpense && (
              <p className="text-xs text-gray-500 mt-1">
                {data.metrics.largestExpense.description} -{" "}
                {data.metrics.largestExpense.category}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categoria Mais Gastada
            </CardTitle>
            <PieChartIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.metrics.topCategory
                ? formatCurrency(data.metrics.topCategory.value)
                : "N/A"}
            </div>
            {data.metrics.topCategory && (
              <p className="text-xs text-gray-500 mt-1">
                {data.metrics.topCategory.name}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Economia
            </CardTitle>
            <Percent className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.metrics.savingsRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Do que você recebeu no período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Financeiros */}
      <FinancialInsights months={period} />

      {/* Gráfico de evolução do saldo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Evolução do Saldo
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
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
