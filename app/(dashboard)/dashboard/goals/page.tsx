"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { GoalCard } from "@/components/goals/goal-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Target,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: string;
  createdAt: string;
  transactions: {
    id: string;
    amount: number;
    description: string;
    date: string;
  }[];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(Array.isArray(data) ? data : data.goals || data.data || []);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Erro ao carregar metas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.targetAmount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          deadline: formData.deadline || null,
        }),
      });

      if (res.ok) {
        toast.success("Meta criada com sucesso!");
        setIsCreateOpen(false);
        setFormData({ name: "", targetAmount: "", deadline: "" });
        fetchGoals();
      } else {
        toast.error("Erro ao criar meta");
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Erro ao criar meta");
    }
  };

  const handleUpdate = async () => {
    if (!editingGoal) return;

    try {
      const res = await fetch(`/api/goals/${editingGoal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          deadline: formData.deadline || null,
        }),
      });

      if (res.ok) {
        toast.success("Meta atualizada!");
        setEditingGoal(null);
        setFormData({ name: "", targetAmount: "", deadline: "" });
        fetchGoals();
      } else {
        toast.error("Erro ao atualizar meta");
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Erro ao atualizar meta");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Meta excluída!");
        setDeletingId(null);
        fetchGoals();
      } else {
        toast.error("Erro ao excluir meta");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Erro ao excluir meta");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline
        ? format(new Date(goal.deadline), "yyyy-MM-dd")
        : "",
    });
  };

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");

  const totalReserved = activeGoals.reduce(
    (sum, g) => sum + Number(g.currentAmount),
    0
  );

  const totalTarget = activeGoals.reduce(
    (sum, g) => sum + Number(g.targetAmount),
    0
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6 animate-in fade-in-50 duration-500">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Stats Skeletons */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Goals Skeletons */}
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Metas Financeiras
          </h1>
          <p className="text-muted-foreground">
            Acompanhe e alcance seus objetivos financeiros
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          size="sm"
          className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/70 backdrop-blur-sm hover:shadow-md transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Metas Ativas"
          value={activeGoals.length}
          description="Em andamento"
          icon={Target}
          color="purple"
          format="number"
          animated
        />
        <StatCard
          title="Concluídas"
          value={completedGoals.length}
          description="Objetivos alcançados"
          icon={CheckCircle2}
          color="green"
          format="number"
          animated
        />
        <StatCard
          title="Total Reservado"
          value={totalReserved}
          description={`Meta: ${formatCurrency(totalTarget)}`}
          icon={TrendingUp}
          color="blue"
          animated
        />
      </div>

      {/* Metas Ativas */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Metas em Andamento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="relative group">
                <GoalCard
                  id={goal.id}
                  name={goal.name}
                  targetAmount={Number(goal.targetAmount)}
                  currentAmount={Number(goal.currentAmount)}
                  deadline={goal.deadline ? new Date(goal.deadline) : null}
                  status={goal.status}
                />
                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(goal)}
                    className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingId(goal.id)}
                    className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metas Concluídas */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Metas Concluídas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                id={goal.id}
                name={goal.name}
                targetAmount={Number(goal.targetAmount)}
                currentAmount={Number(goal.currentAmount)}
                deadline={goal.deadline ? new Date(goal.deadline) : null}
                status={goal.status}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta criada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira meta financeira
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingGoal}
        onOpenChange={() => {
          setIsCreateOpen(false);
          setEditingGoal(null);
          setFormData({ name: "", targetAmount: "", deadline: "" });
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? "Editar Meta" : "Nova Meta"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Meta *</Label>
              <Input
                id="name"
                placeholder="Ex: Viagem para Europa"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="min-h-11"
              />
            </div>

            <div>
              <Label htmlFor="targetAmount">Valor Alvo (R$) *</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
                className="min-h-11"
              />
            </div>

            <div>
              <Label htmlFor="deadline">Prazo (opcional)</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="min-h-11"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingGoal(null);
                setFormData({ name: "", targetAmount: "", deadline: "" });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={editingGoal ? handleUpdate : handleCreate}>
              {editingGoal ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta meta? Todas as reservas
              vinculadas serão mantidas mas desvinculadas. Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
