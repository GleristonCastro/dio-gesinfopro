import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { ArrowDownIcon, ArrowUpIcon, PiggyBank } from "lucide-react";

type Transaction = {
  id: string;
  amount: any;
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

    return transactions;
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
}

export async function RecentTransactions() {
  const transactions = await getRecentTransactions();

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma transação ainda. Use o chat ao lado para registrar!
      </p>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[200px] pe-4">
      {transactions.map((transaction) => {
        const isReserve = transaction.type === "EXPENSE" && transaction.goalId;
        const isIncome = transaction.type === "INCOME";

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isIncome
                    ? "bg-green-500/10 text-green-500"
                    : isReserve
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {isIncome ? (
                  <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
                ) : isReserve ? (
                  <PiggyBank className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.category?.name || "Sem categoria"} •{" "}
                  {new Date(transaction.date).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <p
              className={`text-sm font-semibold ${
                isIncome
                  ? "text-green-500"
                  : isReserve
                  ? "text-blue-500"
                  : "text-red-500"
              }`}
            >
              {isIncome ? "+" : "-"}R${" "}
              {Number(transaction.amount).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
