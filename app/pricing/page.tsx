async function subscribe(plan: "starter" | "pro" | "business") {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error al abrir Stripe.");
    return;
  }

  window.location.href = data.url;
}