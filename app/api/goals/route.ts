import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

// Função helper para verificar e atualizar status de metas concluídas
async function checkAndUpdateGoalStatus(goalId: string) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal || goal.status === "COMPLETED") {
    return goal;
  }

  // Se o valor atual atingiu ou ultrapassou o objetivo, marcar como concluída
  if (Number(goal.currentAmount) >= Number(goal.targetAmount)) {
    return await prisma.goal.update({
      where: { id: goalId },
      data: { status: "COMPLETED" },
    });
  }

  return goal;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        transactions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    // Verificar e atualizar status de cada meta
    const updatedGoals = await Promise.all(
      goals.map(async (goal) => {
        const updated = await checkAndUpdateGoalStatus(goal.id);
        return updated || goal;
      })
    );

    return NextResponse.json({ goals: updatedGoals });
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar metas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { name, targetAmount, deadline } = await req.json();

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: "Nome e valor da meta são obrigatórios" },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        name,
        targetAmount,
        deadline: deadline ? new Date(deadline) : null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 });
  }
}
