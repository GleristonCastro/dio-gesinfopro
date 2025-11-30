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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;
    const { name, targetAmount, deadline } = await req.json();

    // Verificar se a meta pertence ao usuário
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar meta
    const goal = await prisma.goal.update({
      where: { id },
      data: {
        name,
        targetAmount,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    // Verificar se precisa atualizar o status após a edição
    const updatedGoal = await checkAndUpdateGoalStatus(id);

    return NextResponse.json({ goal: updatedGoal || goal });
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar meta" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;

    // Verificar se a meta pertence ao usuário
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    // Deletar meta
    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Meta excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    return NextResponse.json(
      { error: "Erro ao excluir meta" },
      { status: 500 }
    );
  }
}
