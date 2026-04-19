// app/api/stripe/connect/create-account/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, stripe_account_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    if (profile.stripe_account_id) {
      return NextResponse.json({
        stripeAccountId: profile.stripe_account_id,
        alreadyExists: true,
      });
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
      business_type: "individual",
      metadata: {
        user_id: user.id,
        full_name: profile.full_name ?? "",
      },
    });

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_account_id: account.id,
        stripe_onboarding_complete: false,
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Cuenta Stripe creada pero no se pudo guardar en la base de datos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      stripeAccountId: account.id,
      alreadyExists: false,
    });
  } catch (error) {
    console.error("CREATE_CONNECT_ACCOUNT_ERROR", error);
    return NextResponse.json(
      { error: "No se pudo crear la cuenta Connect" },
      { status: 500 }
    );
  }
}