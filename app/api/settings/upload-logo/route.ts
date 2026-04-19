import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = String(formData.get("userId") || "");

    if (!file) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: "Falta NEXT_PUBLIC_SUPABASE_URL" }, { status: 500 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filePath = `${userId}/logo.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(filePath, fileBytes, {
        contentType: file.type || "image/png",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(filePath);

    const logoUrl = publicData.publicUrl;

    const { error: settingsError } = await supabase
      .from("settings")
      .upsert({
        user_id: userId,
        logo_url: logoUrl,
      }, {
        onConflict: "user_id",
      });

    if (settingsError) {
      return NextResponse.json({ error: settingsError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, logoUrl });
  } catch (error) {
    console.error("UPLOAD_LOGO_FATAL", error);
    return NextResponse.json({ error: "Error interno subiendo logo" }, { status: 500 });
  }
}