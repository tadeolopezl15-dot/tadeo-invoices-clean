import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

type Item = {
  description: string;
  quantity: number;
  unit_price: number;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

function normalizeDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !invoice) {
    redirect("/invoice");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("logo_url")
    .eq("id", invoice.user_id)
    .single();

  const items: Item[] =
    Array.isArray(invoice.items) && invoice.items.length > 0 ? invoice.items : [];

  const currency = invoice.currency || "USD";
  const subtotal = Number(invoice.subtotal || 0);
  const tax = Number(invoice.tax || 0);
  const total = Number(invoice.total || 0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #f3f6fb 100%)",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "40px",
                color: "#0f172a",
                letterSpacing: "-0.03em",
              }}
            >
              Factura {invoice.invoice_number || ""}
            </h1>
            <p
              style={{
                marginTop: "10px",
                color: "#64748b",
                fontSize: "16px",
              }}
            >
              Vista profesional de tu factura.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/invoice" style={secondaryButton}>
              Volver
            </Link>

            <Link href={`/invoice/${invoice.id}/edit`} style={secondaryButton}>
              Editar
            </Link>

            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              style={primaryButton}
            >
              Descargar PDF
            </a>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "30px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
            border: "1px solid #e5eaf1",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: "24px",
              paddingBottom: "24px",
              borderBottom: "1px solid #e7edf5",
            }}
          >
            <div>
              {profile?.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Logo de empresa"
                  style={{
                    maxHeight: "70px",
                    maxWidth: "220px",
                    objectFit: "contain",
                    marginBottom: "16px",
                  }}
                />
              ) : null}

              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "10px",
                }}
              >
                {invoice.company_name || "Mi Empresa"}
              </div>

              <div style={mutedBlock}>
                <div>
                  <strong style={strongLabel}>Email:</strong>{" "}
                  {invoice.company_email || "—"}
                </div>
                <div>
                  <strong style={strongLabel}>Factura #:</strong>{" "}
                  {invoice.invoice_number || "—"}
                </div>
                <div>
                  <strong style={strongLabel}>Estado:</strong>{" "}
                  {invoice.status || "—"}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e7edf5",
                borderRadius: "18px",
                padding: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Facturar a
              </div>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "8px",
                }}
              >
                {invoice.client_name || "Cliente"}
              </div>

              <div style={mutedBlock}>
                <div>
                  <strong style={strongLabel}>Email:</strong>{" "}
                  {invoice.client_email || "—"}
                </div>
                <div>
                  <strong style={strongLabel}>Fecha emisión:</strong>{" "}
                  {normalizeDate(invoice.issue_date)}
                </div>
                <div>
                  <strong style={strongLabel}>Vencimiento:</strong>{" "}
                  {normalizeDate(invoice.due_date)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "28px" }}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "16px",
                fontSize: "24px",
                color: "#0f172a",
              }}
            >
              Productos o servicios
            </h2>

            {items.length === 0 ? (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e7edf5",
                  borderRadius: "16px",
                  padding: "18px",
                  color: "#64748b",
                }}
              >
                Esta factura no tiene líneas registradas.
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid #e7edf5",
                  borderRadius: "18px",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: "760px",
                    borderCollapse: "collapse",
                    background: "#fff",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={th}>Descripción</th>
                      <th style={th}>Cantidad</th>
                      <th style={th}>Precio</th>
                      <th style={th}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td style={td}>{item.description || "—"}</td>
                        <td style={td}>{item.quantity || 0}</td>
                        <td style={td}>
                          {money(item.unit_price || 0, currency)}
                        </td>
                        <td style={td}>
                          {money(
                            Number(item.quantity || 0) *
                              Number(item.unit_price || 0),
                            currency
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "28px",
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e7edf5",
                borderRadius: "18px",
                padding: "18px",
                color: "#64748b",
                lineHeight: 1.7,
                fontSize: "14px",
              }}
            >
              Esta factura usa el logo del miembro que la creó. También queda lista
              para una futura vista pública y para un PDF mejorado con branding.
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e7edf5",
                borderRadius: "18px",
                padding: "20px",
              }}
            >
              <div style={summaryRow}>
                <span>Subtotal</span>
                <strong>{money(subtotal, currency)}</strong>
              </div>

              <div style={summaryRow}>
                <span>Tax</span>
                <strong>{money(tax, currency)}</strong>
              </div>

              <div
                style={{
                  ...summaryRow,
                  marginTop: "12px",
                  paddingTop: "14px",
                  borderTop: "1px solid #dbe4ee",
                  fontSize: "22px",
                }}
              >
                <span>Total</span>
                <strong>{money(total, currency)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "14px",
  fontSize: "14px",
  color: "#64748b",
  borderBottom: "1px solid #e6e9ee",
};

const td: React.CSSProperties = {
  padding: "14px",
  borderBottom: "1px solid #eef1f4",
  verticalAlign: "top",
  color: "#0f172a",
};

const summaryRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  color: "#0f172a",
  fontSize: "16px",
  marginBottom: "10px",
};

const mutedBlock: React.CSSProperties = {
  color: "#64748b",
  lineHeight: 1.8,
  fontSize: "15px",
};

const strongLabel: React.CSSProperties = {
  color: "#334155",
};

const primaryButton: React.CSSProperties = {
  display: "inline-block",
  background: "#25569d",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  padding: "14px 18px",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
};

const secondaryButton: React.CSSProperties = {
  display: "inline-block",
  background: "#eef4ff",
  color: "#25569d",
  border: "1px solid #d5e3fb",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "14px",
  fontWeight: 700,
  textDecoration: "none",
};