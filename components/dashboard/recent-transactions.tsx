import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { RecentTransactionsClient } from "./recent-transactions-client";

type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  description: string;
  date: Date;
  goalId: string | null;
  category: {
    name: string;
  } | null;
};

async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return [];
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
      include: {
        category: true,
      },
    });

    // Convert Decimal to number for client components
    return transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
}

export async function RecentTransactions() {
  const transactions = await getRecentTransactions();
  return <RecentTransactionsClient transactions={transactions} />;
}
