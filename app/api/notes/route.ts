import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const note = await prisma.note.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ content: note?.content || "" });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Erro ao buscar nota" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { content } = await req.json();

    const note = await prisma.note.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        content,
      },
      create: {
        userId: session.user.id,
        content,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Erro ao salvar nota" }, { status: 500 });
  }
}
