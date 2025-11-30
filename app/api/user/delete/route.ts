import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";

export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Deletar todos os dados do usuário em cascata
    // Prisma vai deletar automaticamente sessions, transactions, goals, etc. por causa do onDelete: Cascade
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Erro ao deletar conta" },
      { status: 500 }
    );
  }
}
