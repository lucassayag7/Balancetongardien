import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase-server";

export async function GET() {
  const authUser = await getUser();
  if (!authUser) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      _count: { select: { reports: true, validations: true } },
      buildings: {
        include: {
          building: {
            select: { id: true, address: true, city: true, score: true, reportCount: true },
          },
        },
        take: 5,
      },
    },
  });

  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: user.id,
      pseudo: user.pseudo,
      email: user.email,
      verified: user.verified,
      reportCount: user._count.reports,
      validationCount: user._count.validations,
      createdAt: user.createdAt,
      buildings: user.buildings.map((b) => b.building),
    },
  });
}
