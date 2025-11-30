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
    <PageTransition className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
      </FadeIn>

      <Suspense fallback={<BalanceCardsSkeleton />}>
        <BalanceCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalReserved={totalReserved}
          balance={balance}
        />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Chat Widget */}
        <div className="lg:col-span-1">
          <Suspense fallback={<ChatWidgetSkeleton />}>
            <ChatWidget compact />
          </Suspense>
        </div>

        {/* Cards laterais */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Suas últimas movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<RecentTransactionsSkeleton />}>
                <RecentTransactions />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metas Ativas</CardTitle>
              <CardDescription>
                Acompanhe o progresso das suas metas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ActiveGoalsSkeleton />}>
                <ActiveGoals />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
