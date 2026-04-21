import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const formData = await req.formData();
    const file = formData.get("logo");

    if (!(file instanceof File)) {
      return NextResponse.redirect(new URL("/configuracion?error=no-file", req.url));
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filePath = `${user.id}/logo.${ext}`;

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: uploadError } = await admin.storage
      .from("logos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("LOGO_UPLOAD_ERROR", uploadError);
      return NextResponse.redirect(new URL("/configuracion?error=upload", req.url));
    }

    const { data: publicData } = admin.storage.from("logos").getPublicUrl(filePath);

    const logoUrl = publicData.publicUrl;

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: user.id,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("PROFILE_LOGO_SAVE_ERROR", profileError);
      return NextResponse.redirect(new URL("/configuracion?error=profile", req.url));
    }

    return NextResponse.redirect(new URL("/configuracion?success=logo", req.url));
  } catch (error) {
    console.error("UPLOAD_LOGO_ROUTE_ERROR", error);
    return NextResponse.redirect(new URL("/configuracion?error=unexpected", req.url));
  }
}