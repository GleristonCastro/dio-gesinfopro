"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface TransactionFormProps {
  categories: Category[];
  onSuccess: () => void;
}

export function TransactionForm({
  categories,
  onSuccess,
}: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (res.ok) {
        setOpen(false);
        setFormData({
          description: "",
          amount: "",
          type: "EXPENSE",
          categoryId: "",
          date: new Date().toISOString().split("T")[0],
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-linear-to-br from-white/95 to-gray-50/90 dark:from-gray-900/95 dark:to-gray-950/90 backdrop-blur-xl border-white/20 dark:border-gray-800/50">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ex: Almoço no restaurante"
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Valor (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "INCOME" | "EXPENSE",
                })
              }
              className="w-full h-10 rounded-md border bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 backdrop-blur-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Categoria</label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full h-10 rounded-md border bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 backdrop-blur-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Data</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
