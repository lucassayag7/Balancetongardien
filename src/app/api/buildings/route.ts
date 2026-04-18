import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postalCode = searchParams.get("postalCode");
  const query = searchParams.get("q");

  const buildings = await prisma.building.findMany({
    where: {
      ...(postalCode ? { postalCode } : {}),
      ...(query
        ? {
            OR: [
              { address: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { reports: true, residents: true } },
    },
    orderBy: { score: "asc" },
    take: 50,
  });

  return NextResponse.json({ buildings });
}
