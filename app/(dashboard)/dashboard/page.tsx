import { BalanceCards } from "@/components/dashboard/balance-cards";
import { ChatWidget } from "@/components/dashboard/chat-widget";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { ActiveGoals } from "@/components/dashboard/active-goals";
import {
  PageTransition,
  FadeIn,
} from "@/components/animations/page-transitions";
import {
  BalanceCardsSkeleton,
  RecentTransactionsSkeleton,
  ActiveGoalsSkeleton,
  ChatWidgetSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

// Mark page as dynamic since it uses authentication
export const dynamic = "force-dynamic";

async function getSummary() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        totalReserved: 0,
        balance: 0,
      };
    }

    const [income, expense, reserved] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId: session.user.id, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "EXPENSE",
          goalId: null, // Apenas despesas que NÃO são reservas
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "EXPENSE",
          goalId: { not: null }, // Apenas despesas que SÃO reservas (vinculadas a metas)
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(income._sum.amount) || 0;
    const totalExpense = Number(expense._sum.amount) || 0;
    const totalReserved = Number(reserved._sum.amount) || 0;
    const balance = totalIncome - totalExpense - totalReserved;

    return {
      totalIncome,
      totalExpense,
      totalReserved,
      balance,
    };
  } catch (error) {
    console.error("Error fetching summary:", error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      totalReserved: 0,
      balance: 0,
    };
  }
}

export default async function DashboardPage() {
  const { totalIncome, totalExpense, totalReserved, balance } =
    await getSummary();

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visão geral e controle total das suas finanças
          </p>
        </div>
      </FadeIn>

      {/* StatCards principais */}
      <Suspense fallback={<BalanceCardsSkeleton />}>
        <BalanceCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalReserved={totalReserved}
          balance={balance}
        />
      </Suspense>

      {/* Grid principal: Chat + Widgets laterais */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Widget - ocupa 2 colunas */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ChatWidgetSkeleton />}>
            <ChatWidget compact />
          </Suspense>
        </div>

        {/* Metas Ativas - 1 coluna */}
        <Card className="bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="border-b border-white/20 dark:border-gray-800/50 bg-gradient-to-r from-purple-600/10 to-pink-600/10 dark:from-purple-500/20 dark:to-pink-500/20">
            <CardTitle className="flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400">🎯</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Metas Ativas
              </span>
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso das suas metas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Suspense fallback={<ActiveGoalsSkeleton />}>
              <ActiveGoals />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes - card largo */}
      <Card className="bg-linear-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="border-b border-white/20 dark:border-gray-800/50 bg-linear-to-r from-blue-600/10 to-cyan-600/10 dark:from-blue-500/20 dark:to-cyan-500/20">
          <CardTitle className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">💳</span>
            <span className="bg-linear-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Transações Recentes
            </span>
          </CardTitle>
          <CardDescription>
            Suas últimas movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Suspense fallback={<RecentTransactionsSkeleton />}>
            <RecentTransactions />
          </Suspense>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
