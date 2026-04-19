import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(37,86,157,0.10), transparent 28%), radial-gradient(circle at top right, rgba(14,165,233,0.08), transparent 24%), linear-gradient(180deg, #fbfdff 0%, #f3f7fb 100%)",
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <section
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "22px 20px 80px",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "18px",
                overflow: "hidden",
                background: "#ffffff",
                border: "1px solid #dbe7f8",
                boxShadow: "0 12px 28px rgba(37, 86, 157, 0.18)",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Image
                src="/logo-tadeo-invoices.png"
                alt="Tadeo Invoices Logo"
                fill
                sizes="82px"
                style={{
                  objectFit: "contain",
                  padding: "6px",
                }}
                priority
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                Tadeo Invoices
              </div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                Billing platform for real businesses
              </div>
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link href="/pricing" style={navLink}>
              Pricing
            </Link>
            <Link href="/login" style={navLink}>
              Login
            </Link>
            <Link href="/signup" style={primaryButton}>
              Empezar
            </Link>
          </nav>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.08fr 0.92fr",
            gap: "28px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "#eef4ff",
                color: "#25569d",
                border: "1px solid #d5e3fb",
                borderRadius: "999px",
                padding: "9px 16px",
                fontSize: "13px",
                fontWeight: 800,
                marginBottom: "18px",
                boxShadow: "0 8px 18px rgba(37, 86, 157, 0.08)",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: "#25569d",
                }}
              />
              Facturación profesional con marca propia
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "62px",
                lineHeight: 0.98,
                letterSpacing: "-0.06em",
                maxWidth: "760px",
              }}
            >
              Crea, comparte y cobra facturas con una imagen que sí se ve premium.
            </h1>

            <p
              style={{
                marginTop: "20px",
                fontSize: "18px",
                lineHeight: 1.75,
                color: "#64748b",
                maxWidth: "690px",
              }}
            >
              Dale a cada miembro su propio logo, genera PDFs elegantes, comparte
              enlaces públicos y cobra con Stripe desde una misma plataforma. Todo
              con una experiencia limpia, rápida y lista para vender.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "28px",
              }}
            >
              <Link href="/signup" style={primaryButtonLarge}>
                Crear cuenta
              </Link>

              <Link href="/pricing" style={secondaryButtonLarge}>
                Ver planes
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "16px",
                marginTop: "34px",
                maxWidth: "780px",
              }}
            >
              <div style={miniStat}>
                <div style={miniStatNumber}>Branding</div>
                <div style={miniStatText}>
                  Cada miembro usa su propio logo y presencia visual.
                </div>
              </div>

              <div style={miniStat}>
                <div style={miniStatNumber}>Público</div>
                <div style={miniStatText}>
                  Comparte la factura por link sin pedir login al cliente.
                </div>
              </div>

              <div style={miniStat}>
                <div style={miniStatNumber}>Cobro</div>
                <div style={miniStatText}>
                  Cobra con Stripe Checkout y confirma pagos en tu sistema.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "22px -8px -10px 18px",
                background:
                  "linear-gradient(180deg, rgba(37,86,157,0.16) 0%, rgba(59,130,246,0.06) 100%)",
                borderRadius: "32px",
                filter: "blur(20px)",
              }}
            />

            <div
              style={{
                position: "relative",
                background: "#ffffff",
                borderRadius: "30px",
                border: "1px solid #e5eaf1",
                boxShadow: "0 24px 50px rgba(15, 23, 42, 0.10)",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                <div style={dot("#f87171")} />
                <div style={dot("#fbbf24")} />
                <div style={dot("#34d399")} />
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                  border: "1px solid #e7edf5",
                  borderRadius: "24px",
                  padding: "22px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "18px",
                    marginBottom: "22px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: "124px",
                        height: "54px",
                        borderRadius: "14px",
                        background: "#eef4ff",
                        border: "1px solid #d5e3fb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#25569d",
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      TU LOGO
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#0f172a",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      INVOICE
                    </div>
                    <div style={{ color: "#64748b", marginTop: "6px" }}>
                      INV-2026-001
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        marginTop: "10px",
                        background: "#fff7e8",
                        color: "#b26b00",
                        border: "1px solid #f1ddb0",
                        borderRadius: "999px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Pending
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                    marginBottom: "18px",
                  }}
                >
                  <div style={infoCard}>
                    <div style={infoTitle}>From</div>
                    <div style={infoMain}>Tu Empresa LLC</div>
                    <div style={infoText}>info@empresa.com</div>
                    <div style={infoText}>+1 (555) 201-9483</div>
                  </div>

                  <div style={infoCard}>
                    <div style={infoTitle}>Bill To</div>
                    <div style={infoMain}>Cliente Demo</div>
                    <div style={infoText}>cliente@email.com</div>
                    <div style={infoText}>Issue: Apr 16, 2026</div>
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid #e7edf5",
                    borderRadius: "18px",
                    overflow: "hidden",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 0.7fr 1fr 1fr",
                      background: "#f8fafc",
                      padding: "12px 14px",
                      fontWeight: 700,
                      color: "#334155",
                      fontSize: "14px",
                    }}
                  >
                    <div>Description</div>
                    <div>Qty</div>
                    <div>Price</div>
                    <div>Total</div>
                  </div>

                  <div style={tableRow}>
                    <div>Diseño e instalación premium</div>
                    <div>1</div>
                    <div>$950</div>
                    <div>$950</div>
                  </div>

                  <div style={tableRow}>
                    <div>Material adicional y detalle final</div>
                    <div>1</div>
                    <div>$150</div>
                    <div>$150</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 220px",
                    gap: "18px",
                    alignItems: "end",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e7edf5",
                      borderRadius: "18px",
                      padding: "14px",
                      color: "#64748b",
                      lineHeight: 1.7,
                      fontSize: "14px",
                    }}
                  >
                    Comparte esta factura con un link público y permite pagarla
                    con Stripe en segundos.
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e7edf5",
                      borderRadius: "18px",
                      padding: "16px",
                    }}
                  >
                    <div style={summaryRow}>
                      <span>Subtotal</span>
                      <strong>$1,100</strong>
                    </div>
                    <div style={summaryRow}>
                      <span>Tax</span>
                      <strong>$0</strong>
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
                      <strong>$1,100</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                right: "-12px",
                top: "52px",
                background: "#ffffff",
                border: "1px solid #e5eaf1",
                borderRadius: "18px",
                boxShadow: "0 14px 30px rgba(15, 23, 42, 0.10)",
                padding: "14px 16px",
                minWidth: "180px",
              }}
            >
              <div style={{ color: "#64748b", fontSize: "12px", fontWeight: 700 }}>
                PAYMENT STATUS
              </div>
              <div
                style={{
                  marginTop: "8px",
                  color: "#15803d",
                  fontSize: "24px",
                  fontWeight: 800,
                }}
              >
                Paid
              </div>
              <div style={{ marginTop: "4px", color: "#64748b", fontSize: "13px" }}>
                Confirmado por Stripe
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: "76px" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "42px",
                letterSpacing: "-0.05em",
              }}
            >
              Todo lo que necesitas para facturar mejor
            </h2>
            <p
              style={{
                marginTop: "12px",
                color: "#64748b",
                fontSize: "17px",
              }}
            >
              Pensado para negocios que quieren verse profesionales y cobrar más rápido.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <div style={featureCard}>
              <div style={featureIcon}>01</div>
              <div style={featureTitle}>Branding por miembro</div>
              <div style={featureText}>
                Cada usuario sube su logo, usa su marca y personaliza la factura
                sin tocar código.
              </div>
            </div>

            <div style={featureCard}>
              <div style={featureIcon}>02</div>
              <div style={featureTitle}>Links públicos</div>
              <div style={featureText}>
                Comparte la factura en segundos con un enlace elegante y accesible
                para el cliente.
              </div>
            </div>

            <div style={featureCard}>
              <div style={featureIcon}>03</div>
              <div style={featureTitle}>Cobro integrado</div>
              <div style={featureText}>
                Cobra online con Stripe, confirma pagos por webhook y mantén tu
                panel actualizado.
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: "72px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            borderRadius: "30px",
            padding: "34px",
            boxShadow: "0 24px 50px rgba(15, 23, 42, 0.18)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: "680px" }}>
            <div
              style={{
                fontSize: "14px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)",
                fontWeight: 700,
              }}
            >
              Empieza hoy
            </div>

            <h3
              style={{
                margin: "12px 0 0",
                fontSize: "38px",
                lineHeight: 1.05,
                letterSpacing: "-0.05em",
              }}
            >
              Convierte tu proceso de facturación en una experiencia más premium.
            </h3>

            <p
              style={{
                marginTop: "14px",
                color: "rgba(255,255,255,0.76)",
                lineHeight: 1.7,
                fontSize: "16px",
              }}
            >
              Lanza tu cuenta, sube tu logo y empieza a compartir facturas con un
              diseño que realmente se ve profesional.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/signup" style={ctaPrimary}>
              Crear cuenta
            </Link>
            <Link href="/pricing" style={ctaSecondary}>
              Ver pricing
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function dot(color: string): React.CSSProperties {
  return {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: color,
  };
}

const navLink: React.CSSProperties = {
  color: "#334155",
  textDecoration: "none",
  fontWeight: 700,
  padding: "10px 12px",
};

const primaryButton: React.CSSProperties = {
  background: "#25569d",
  color: "#fff",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  fontWeight: 700,
  boxShadow: "0 10px 20px rgba(37, 86, 157, 0.20)",
};

const primaryButtonLarge: React.CSSProperties = {
  background: "#25569d",
  color: "#fff",
  textDecoration: "none",
  padding: "15px 22px",
  borderRadius: "14px",
  fontWeight: 800,
  fontSize: "16px",
  boxShadow: "0 10px 20px rgba(37, 86, 157, 0.22)",
};

const secondaryButtonLarge: React.CSSProperties = {
  background: "#ffffff",
  color: "#25569d",
  border: "1px solid #d5e3fb",
  textDecoration: "none",
  padding: "15px 22px",
  borderRadius: "14px",
  fontWeight: 800,
  fontSize: "16px",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
};

const miniStat: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5eaf1",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
};

const miniStatNumber: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 800,
  color: "#0f172a",
};

const miniStatText: React.CSSProperties = {
  marginTop: "8px",
  color: "#64748b",
  fontSize: "14px",
  lineHeight: 1.65,
};

const infoCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e7edf5",
  borderRadius: "16px",
  padding: "14px",
};

const infoTitle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const infoMain: React.CSSProperties = {
  marginTop: "8px",
  fontWeight: 800,
  color: "#0f172a",
};

const infoText: React.CSSProperties = {
  marginTop: "6px",
  color: "#64748b",
  fontSize: "14px",
};

const tableRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 0.7fr 1fr 1fr",
  padding: "12px 14px",
  borderTop: "1px solid #eef2f7",
  color: "#475569",
  fontSize: "14px",
};

const summaryRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  color: "#0f172a",
  fontSize: "15px",
  marginBottom: "10px",
};

const featureCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5eaf1",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
};

const featureIcon: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "#eef4ff",
  border: "1px solid #d5e3fb",
  color: "#25569d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  marginBottom: "16px",
};

const featureTitle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 800,
  color: "#0f172a",
};

const featureText: React.CSSProperties = {
  marginTop: "10px",
  color: "#64748b",
  lineHeight: 1.7,
  fontSize: "15px",
};

const ctaPrimary: React.CSSProperties = {
  background: "#fff",
  color: "#0f172a",
  textDecoration: "none",
  padding: "14px 20px",
  borderRadius: "14px",
  fontWeight: 800,
};

const ctaSecondary: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  textDecoration: "none",
  padding: "14px 20px",
  borderRadius: "14px",
  fontWeight: 800,
  border: "1px solid rgba(255,255,255,0.16)",
};