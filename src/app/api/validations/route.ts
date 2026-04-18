import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { reportId, type, comment } = await request.json();

  if (!reportId || !["CONFIRM", "DENY"].includes(type)) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "Signalement introuvable" }, { status: 404 });
  if (report.userId === user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas valider votre propre signalement" }, { status: 403 });
  }

  const validation = await prisma.validation.upsert({
    where: { reportId_userId: { reportId, userId: user.id } },
    update: { type, comment },
    create: { reportId, userId: user.id, type, comment },
  });

  return NextResponse.json({ validation }, { status: 201 });
}
