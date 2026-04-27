if (event.type === "checkout.session.completed") {
  const session = event.data.object as any;

  if (session.metadata?.type === "invoice_payment") {
    const invoiceId = session.metadata.invoice_id;

    await supabaseAdmin
      .from("invoices")
      .update({
        status: "paid",
        payment_status: "paid",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        paid_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);
  }
}