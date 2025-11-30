import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";

const DEFAULT_CATEGORIES = [
  { name: "Alimentação", icon: "🍔", color: "#ef4444" },
  { name: "Transporte", icon: "🚗", color: "#3b82f6" },
  { name: "Moradia", icon: "🏠", color: "#8b5cf6" },
  { name: "Saúde", icon: "💊", color: "#10b981" },
  { name: "Lazer", icon: "🎮", color: "#f59e0b" },
  { name: "Educação", icon: "📚", color: "#06b6d4" },
  { name: "Outros", icon: "📦", color: "#6b7280" },
];

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar categorias padrão e do usuário
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: null }, // Categorias padrão
          { userId: session.user.id }, // Categorias do usuário
        ],
      },
      orderBy: {
        name: "asc",
      },
    });

    // Se não houver categorias padrão, criar
    if (categories.length === 0) {
      const created = await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          isCustom: false,
        })),
      });

      // Buscar novamente
      const newCategories = await prisma.category.findMany({
        where: { userId: null },
        orderBy: { name: "asc" },
      });

      return NextResponse.json(newCategories);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
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

    const body = await req.json();
    const { name, icon, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        isCustom: true,
        userId: session.user.id,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}
