"use client";

export default function ReportesPage() {
  return (
    <main className="app-shell">
      <div className="app-container">

        <div className="page-header">
          <div>
            <h1 className="page-title">Reportes</h1>
            <p className="page-subtitle">
              Analiza tus ingresos y desempeño.
            </p>
          </div>
        </div>

        <div className="grid-auto">
          <div className="metric-card">
            <div className="metric-label">Ingresos</div>
            <div className="metric-value">$0</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Pagadas</div>
            <div className="metric-value">0</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Pendientes</div>
            <div className="metric-value">0</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3 className="card-title">Distribución</h3>
          <div className="stat-bar">
            <div style={{ width: "50%", background: "#22c55e" }} />
            <div style={{ width: "50%", background: "#ef4444" }} />
          </div>
        </div>

      </div>
    </main>
  );
}