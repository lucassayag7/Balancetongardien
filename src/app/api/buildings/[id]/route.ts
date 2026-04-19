import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const building = await prisma.building.findUnique({
    where: { id },
    include: {
      reports: {
        where: { visibility: { not: "PRIVE" } },
        include: {
          media: true,
          validations: { select: { id: true, type: true, userId: true } },
          actions: { select: { id: true, type: true, status: true } },
          building: { select: { address: true, city: true, postalCode: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      _count: { select: { residents: true } },
    },
  });

  if (!building) {
    return NextResponse.json({ error: "Immeuble introuvable" }, { status: 404 });
  }

  return NextResponse.json({ building });
}
