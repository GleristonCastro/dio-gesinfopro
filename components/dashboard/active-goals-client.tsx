"use client";

import { GoalCard } from "@/components/goals/goal-card";
import { Target } from "lucide-react";

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

export function ActiveGoalsClient({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Você ainda não tem metas. Que tal criar uma?
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          id={goal.id}
          name={goal.name}
          targetAmount={goal.targetAmount}
          currentAmount={goal.currentAmount}
          deadline={goal.deadline}
          status={goal.status}
          icon={Target}
          transactions={goal.transactions}
          showTransactions={true}
        />
      ))}
    </div>
  );
}
