import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Selecciona un logo primero" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se permite PNG, JPG, JPEG o WEBP" },
        { status: 400 }
      );
    }

    const admin = getAdminSupabase();

    const ext = file.name.split(".").pop() || "png";
    const filePath = `${user.id}/logo-${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from("logo")
      .upload(filePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("UPLOAD_LOGO_ERROR", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "No se pudo subir el logo" },
        { status: 500 }
      );
    }

    const { data } = admin.storage.from("logo").getPublicUrl(filePath);

    const logoUrl = data.publicUrl;

    const { error: updateError } = await admin
      .from("profiles")
      .update({ logo_url: logoUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("UPDATE_PROFILE_LOGO_ERROR", updateError);
      return NextResponse.json(
        { error: updateError.message || "No se pudo guardar el logo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logoUrl,
    });
  } catch (error) {
    console.error("UPLOAD_LOGO_ROUTE_ERROR", error);

    return NextResponse.json(
      { error: "Error subiendo logo" },
      { status: 500 }
    );
  }
}