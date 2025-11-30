import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { ActiveGoalsClient } from "./active-goals-client";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  status: string;
  transactions: {
    id: string;
    amount: number;
    description: string;
    date: Date;
  }[];
};

async function getActiveGoals(): Promise<Goal[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return [];
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6, // Aumentei para 6 já que agora é grid 2 colunas
      include: {
        transactions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    // Converter Decimal para number para passar ao Client Component
    return goals.map((goal: any) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      deadline: goal.deadline,
      status: goal.status,
      transactions: goal.transactions.map((transaction: any) => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        description: transaction.description,
        date: transaction.date,
      })),
    }));
  } catch (error) {
    console.error("Error fetching active goals:", error);
    return [];
  }
}

export async function ActiveGoals() {
  const goals = await getActiveGoals();
  return <ActiveGoalsClient goals={goals} />;
}
