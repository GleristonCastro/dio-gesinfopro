import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { insightsModel } from "@/lib/gemini/config";
import { FINANCIAL_INSIGHTS_PROMPT } from "@/lib/gemini/prompts";

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

    // Buscar transações do período
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
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calcular métricas
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE" && !t.goalId)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalReserved = transactions
      .filter((t) => t.type === "EXPENSE" && t.goalId)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentBalance = totalIncome - totalExpense - totalReserved;

    const savingsRate =
      totalIncome > 0
        ? Math.round(
            ((totalIncome - totalExpense - totalReserved) / totalIncome) * 100
          )
        : 0;

    // Maior despesa
    const largestExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

    // Distribuição por categoria
    const categoryDistribution: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const categoryName = t.category?.name || "Sem categoria";
        categoryDistribution[categoryName] =
          (categoryDistribution[categoryName] || 0) + Number(t.amount);
      });

    const topCategory = Object.entries(categoryDistribution).sort(
      ([, a], [, b]) => b - a
    )[0];

    // Evolução mensal
    const monthlyEvolution = [];
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
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyEvolution.push({
        month: format(monthDate, "MMM/yy"),
        income,
        expense,
        balance: income - expense,
      });
    }

    // Formatar dados para o prompt
    const categoryDistributionText = Object.entries(categoryDistribution)
      .map(([name, value]) => `- ${name}: R$ ${value.toFixed(2)}`)
      .join("\n");

    const monthlyEvolutionText = monthlyEvolution
      .map(
        (m) =>
          `${m.month}: Receitas R$ ${m.income.toFixed(
            2
          )}, Despesas R$ ${m.expense.toFixed(2)}, Saldo R$ ${m.balance.toFixed(
            2
          )}`
      )
      .join("\n");

    // Gerar prompt
    const prompt = FINANCIAL_INSIGHTS_PROMPT.replace(
      "{totalIncome}",
      totalIncome.toFixed(2)
    )
      .replace("{totalExpense}", totalExpense.toFixed(2))
      .replace("{totalReserved}", totalReserved.toFixed(2))
      .replace("{currentBalance}", currentBalance.toFixed(2))
      .replace("{savingsRate}", savingsRate.toString())
      .replace(
        "{largestExpense}",
        largestExpense
          ? `${largestExpense.description} - R$ ${Number(
              largestExpense.amount
            ).toFixed(2)}`
          : "Nenhuma"
      )
      .replace(
        "{topCategory}",
        topCategory
          ? `${topCategory[0]} (R$ ${topCategory[1].toFixed(2)})`
          : "Nenhuma"
      )
      .replace("{categoryDistribution}", categoryDistributionText)
      .replace("{monthlyEvolution}", monthlyEvolutionText);

    // Chamar Gemini para gerar insights
    let insights;
    try {
      const fullPrompt = `${prompt}\n\nIMPORTANTE: Retorne APENAS o JSON sem nenhum texto adicional, markdown ou explicações. O formato exato deve ser:
{
  "summary": "texto aqui",
  "highlights": ["item 1", "item 2"],
  "concerns": ["item 1", "item 2"],
  "recommendations": ["item 1", "item 2", "item 3"],
  "forecast": "texto aqui"
}`;

      const result = await insightsModel.generateContent(fullPrompt);
      const responseText = result.response.text();

      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from Gemini");
      }

      // Remover markdown code blocks se existirem
      const jsonText = responseText.replace(/```json\n?|\n?```/g, "").trim();
      insights = JSON.parse(jsonText);

      // Validar estrutura
      if (
        !insights.summary ||
        !Array.isArray(insights.highlights) ||
        !Array.isArray(insights.concerns) ||
        !Array.isArray(insights.recommendations) ||
        !insights.forecast
      ) {
        throw new Error("Invalid insights structure");
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      // Fallback: insights básicos
      insights = {
        summary: `Você teve R$ ${totalIncome.toFixed(
          2
        )} em receitas e gastou R$ ${(totalExpense + totalReserved).toFixed(
          2
        )} neste período, com uma taxa de economia de ${savingsRate}%.`,
        highlights: [
          savingsRate > 0
            ? `Parabéns! Você economizou ${savingsRate}% das suas receitas.`
            : "Continue registrando suas transações para melhor controle.",
        ],
        concerns: [
          totalExpense > totalIncome
            ? "Suas despesas ultrapassaram as receitas. Considere revisar seus gastos."
            : "Mantenha o controle dos gastos para sustentar este resultado.",
        ],
        recommendations: [
          "Continue registrando todas as transações diariamente",
          topCategory
            ? `Revise gastos em ${topCategory[0]}, sua categoria com mais despesas`
            : "Categorize suas transações para melhor análise",
          "Defina metas financeiras para manter o foco",
        ],
        forecast:
          "Com base no seu padrão atual, mantenha a disciplina para resultados consistentes.",
      };
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Erro ao gerar insights" },
      { status: 500 }
    );
  }
}
