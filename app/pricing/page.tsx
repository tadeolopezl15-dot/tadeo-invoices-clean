"use client";

import Link from "next/link";

export default function PricingPage() {
  return (
    <main style={wrapper}>
      <section style={container}>
        {/* HEADER */}
        <div style={header}>
          <h1 style={title}>Planes diseñados para crecer contigo</h1>
          <p style={subtitle}>
            Empieza gratis y escala a medida que tu negocio crece. Sin límites
            ocultos.
          </p>
        </div>

        {/* PRICING CARDS */}
        <div style={grid}>
          {/* STARTER */}
          <div style={card}>
            <h3 style={plan}>Starter</h3>
            <p style={desc}>Para comenzar</p>

            <div style={price}>
              $12 <span style={month}>/mes</span>
            </div>

            <ul style={features}>
              <li>✔ 10 facturas / mes</li>
              <li>✔ PDF básico</li>
              <li>✔ Link público</li>
              <li>✔ Branding limitado</li>
            </ul>

            <Link href="/signup" style={btnOutline}>
              Empezar
            </Link>
          </div>

          {/* PRO (DESTACADO) */}
          <div style={cardHighlight}>
            <div style={badge}>MÁS POPULAR</div>

            <h3 style={plan}>Pro</h3>
            <p style={desc}>Para negocios reales</p>

            <div style={priceBig}>
              $29 <span style={month}>/mes</span>
            </div>

            <ul style={features}>
              <li>✔ Facturas ilimitadas</li>
              <li>✔ PDF profesional</li>
              <li>✔ Subir tu logo 🔥</li>
              <li>✔ Cobros con Stripe</li>
              <li>✔ Dashboard completo</li>
            </ul>

            <Link href="/signup" style={btnPrimary}>
              Elegir plan
            </Link>
          </div>

          {/* BUSINESS */}
          <div style={card}>
            <h3 style={plan}>Business</h3>
            <p style={desc}>Para escalar</p>

            <div style={price}>
              $59 <span style={month}>/mes</span>
            </div>

            <ul style={features}>
              <li>✔ Multi-empresa</li>
              <li>✔ Usuarios múltiples</li>
              <li>✔ Reportes avanzados</li>
              <li>✔ Prioridad soporte</li>
            </ul>

            <Link href="/signup" style={btnOutline}>
              Empezar
            </Link>
          </div>
        </div>

        {/* CTA FINAL */}
        <div style={cta}>
          <h2>Empieza hoy y cobra como un negocio profesional</h2>
          <Link href="/signup" style={btnPrimaryLarge}>
            Crear cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ===== STYLES ===== */

const wrapper: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
  fontFamily: "Arial",
};

const container: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "60px 20px",
};

const header: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "50px",
};

const title: React.CSSProperties = {
  fontSize: "42px",
  fontWeight: 800,
};

const subtitle: React.CSSProperties = {
  marginTop: "10px",
  color: "#64748b",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "20px",
  padding: "30px",
  border: "1px solid #e5eaf1",
  textAlign: "center",
};

const cardHighlight: React.CSSProperties = {
  ...card,
  border: "2px solid #25569d",
  transform: "scale(1.05)",
  boxShadow: "0 20px 40px rgba(37,86,157,0.2)",
};

const badge: React.CSSProperties = {
  background: "#25569d",
  color: "#fff",
  padding: "5px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  marginBottom: "10px",
};

const plan: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
};

const desc: React.CSSProperties = {
  color: "#64748b",
  marginBottom: "15px",
};

const price: React.CSSProperties = {
  fontSize: "34px",
  fontWeight: 800,
};

const priceBig: React.CSSProperties = {
  fontSize: "42px",
  fontWeight: 900,
  color: "#25569d",
};

const month: React.CSSProperties = {
  fontSize: "16px",
  color: "#64748b",
};

const features: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "20px 0",
  lineHeight: "2",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  background: "#25569d",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: 700,
};

const btnOutline: React.CSSProperties = {
  ...btnPrimary,
  background: "#fff",
  color: "#25569d",
  border: "1px solid #25569d",
};

const cta: React.CSSProperties = {
  textAlign: "center",
  marginTop: "60px",
};

const btnPrimaryLarge: React.CSSProperties = {
  ...btnPrimary,
  padding: "16px 28px",
  fontSize: "18px",
};