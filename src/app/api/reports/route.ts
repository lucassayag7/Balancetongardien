import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase-server";
import { z } from "zod";

const CreateReportSchema = z.object({
  buildingId: z.string().optional(),
  address: z.string().min(3),
  postalCode: z.string().min(4),
  city: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  category: z.enum(["NETTOYAGE", "MAINTENANCE", "PRESENCE", "COMPORTEMENT", "SECURITE", "ADMINISTRATIF"]),
  subcategory: z.string().optional(),
  severity: z.enum(["MINEUR", "MODERE", "GRAVE"]).default("MODERE"),
  recurrence: z.enum(["PREMIERE_FOIS", "RECURRENT", "CHRONIQUE"]).default("PREMIERE_FOIS"),
  description: z.string().optional(),
  visibility: z.enum(["PUBLIC", "VOISINS", "PRIVE"]).default("PUBLIC"),
  mediaUrls: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const buildingId = searchParams.get("buildingId");
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const reports = await prisma.report.findMany({
    where: {
      ...(buildingId ? { buildingId } : {}),
      ...(category ? { category: category as never } : {}),
      visibility: { not: "PRIVE" },
    },
    include: {
      media: true,
      validations: { select: { id: true, type: true, userId: true } },
      actions: { select: { id: true, type: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const parsed = CreateReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { address, postalCode, city, lat, lng, mediaUrls, buildingId, ...reportData } = parsed.data;

  let building;

  if (buildingId) {
    building = await prisma.building.findUnique({ where: { id: buildingId } });
  }

  if (!building) {
    building = await prisma.building.upsert({
      where: { id: buildingId ?? "none" },
      update: {},
      create: {
        address,
        postalCode,
        city,
        lat: lat ?? 0,
        lng: lng ?? 0,
      },
    });
  }

  const report = await prisma.report.create({
    data: {
      ...reportData,
      buildingId: building.id,
      userId: user.id,
      ...(mediaUrls && mediaUrls.length > 0
        ? {
            media: {
              create: mediaUrls.map((url) => ({
                type: "IMAGE" as const,
                url,
              })),
            },
          }
        : {}),
    },
    include: { media: true, validations: true, actions: true },
  });

  await prisma.building.update({
    where: { id: building.id },
    data: { reportCount: { increment: 1 } },
  });

  return NextResponse.json({ report }, { status: 201 });
}
