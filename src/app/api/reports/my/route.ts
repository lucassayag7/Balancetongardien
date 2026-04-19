import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase-server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const reports = await prisma.report.findMany({
    where: { userId: user.id },
    include: {
      media: true,
      validations: { select: { id: true, type: true, userId: true } },
      actions: true,
      building: { select: { address: true, city: true, postalCode: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}
