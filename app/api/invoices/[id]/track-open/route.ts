import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pixel = Buffer.from(
  "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64"
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const now = new Date().toISOString();

      await supabase
        .from("invoices")
        .update({
          email_opened_at: now,
        })
        .eq("id", id);

      const { data: invoice } = await supabase
        .from("invoices")
        .select("email_open_count")
        .eq("id", id)
        .single();

      await supabase
        .from("invoices")
        .update({
          email_open_count: Number(invoice?.email_open_count || 0) + 1,
        })
        .eq("id", id);
    }
  } catch (error) {
    console.error("TRACK_OPEN_ERROR:", error);
  }

  return new NextResponse(pixel, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(pixel.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}