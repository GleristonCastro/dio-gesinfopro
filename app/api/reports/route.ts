import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get("months") || "3");

    // Calcular período
    const endDate = endOfMonth(new Date());
    const startDate = startOfMonth(subMonths(new Date(), months - 1));

    // Buscar todas as transações do período
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        goal: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Processar dados para os gráficos

    // 1. Evolução do saldo mês a mês
    const balanceEvolution = [];
    let cumulativeBalance = 0;

    for (let i = 0; i < months; i++) {
      const monthDate = subMonths(new Date(), months - 1 - i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = transactions.filter(
        (t) => t.date >= monthStart && t.date <= monthEnd
      );

      const income = monthTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = monthTransactions
        .filter((t) => t.type === "EXPENSE" && !t.goalId)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const reserved = monthTransactions
        .filter((t) => t.type === "EXPENSE" && t.goalId)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      cumulativeBalance += income - expense - reserved;

      balanceEvolution.push({
        month: format(monthDate, "MMM/yy"),
        balance: cumulativeBalance,
        income,
        expense,
        reserved,
      });
    }

    // 2. Distribuição por categoria (apenas despesas)
    const categoryDistribution: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const categoryName = t.category?.name || "Sem categoria";
        categoryDistribution[categoryName] =
          (categoryDistribution[categoryName] || 0) + Number(t.amount);
      });

    const categoryData = Object.entries(categoryDistribution).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // 3. Receitas vs Despesas por mês
    const incomeVsExpense = balanceEvolution.map((item) => ({
      month: item.month,
      income: item.income,
      expense: item.expense + item.reserved,
    }));

    // 4. Métricas gerais
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE" && !t.goalId)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalReserved = transactions
      .filter((t) => t.type === "EXPENSE" && t.goalId)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Maior despesa
    const largestExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

    // Categoria mais gastada
    const topCategory = categoryData.sort((a, b) => b.value - a.value)[0];

    // Taxa de economia
    const savingsRate =
      totalIncome > 0
        ? ((totalIncome - totalExpense - totalReserved) / totalIncome) * 100
        : 0;

    return NextResponse.json({
      balanceEvolution,
      categoryDistribution: categoryData,
      incomeVsExpense,
      metrics: {
        totalIncome,
        totalExpense,
        totalReserved,
        currentBalance: totalIncome - totalExpense - totalReserved,
        largestExpense: largestExpense
          ? {
              amount: Number(largestExpense.amount),
              description: largestExpense.description,
              category: largestExpense.category?.name || "Sem categoria",
            }
          : null,
        topCategory: topCategory || null,
        savingsRate: Math.round(savingsRate),
      },
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatórios" },
      { status: 500 }
    );
  }
}
