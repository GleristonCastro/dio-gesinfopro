"use client";

import { useState } from "react";
import { Target, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

function GoalCard({ goal }: { goal: Goal }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const target = Number(goal.targetAmount);
  const current = Number(goal.currentAmount);
  const progress = target > 0 ? (current / target) * 100 : 0;
  const daysLeft = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="p-4 rounded-lg border bg-card space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-sm">{goal.name}</p>
            {daysLeft !== null && (
              <p className="text-xs text-muted-foreground">
                {daysLeft > 0 ? `${daysLeft} dias restantes` : "Prazo vencido"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">
            {progress.toFixed(0)}% • R${" "}
            {current.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}{" "}
            / R$ {target.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Transações vinculadas - limitado a 3 */}
        {goal.transactions.length > 0 && (
          <div className="mt-3 pt-3 border-t space-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                Reservado nesta meta:
              </p>
              {goal.transactions.length > 3 && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                    >
                      Ver todas ({goal.transactions.length})
                      <ChevronRight
                        className="h-3 w-3 ml-1"
                        aria-hidden="true"
                      />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{goal.name}</DialogTitle>
                      <DialogDescription>
                        Todas as transações vinculadas a esta meta
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {goal.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex justify-between items-start p-2 rounded border"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString(
                                "pt-BR"
                              )}
                            </p>
                          </div>
                          <span className="font-medium text-sm">
                            R${" "}
                            {Number(transaction.amount).toLocaleString(
                              "pt-BR",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {goal.transactions.slice(0, 3).map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between text-xs"
              >
                <span className="text-muted-foreground truncate mr-2">
                  {transaction.description}
                </span>
                <span className="font-medium whitespace-nowrap">
                  R${" "}
                  {Number(transaction.amount).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActiveGoalsClient({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Você ainda não tem metas. Que tal criar uma?
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
