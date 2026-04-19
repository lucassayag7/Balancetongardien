import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase-server";

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `Fichier trop volumineux (max ${MAX_SIZE_MB}Mo)` }, { status: 400 });
    }

    const supabase = await createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from("media")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[upload error]", error.message);
      return NextResponse.json({ error: "Erreur upload: " + error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    return NextResponse.json({ url: publicUrl });
  } catch (e) {
    console.error("[POST /api/upload]", e);
    return NextResponse.json({ error: "Erreur serveur lors de l'upload" }, { status: 500 });
  }
}
