"use client";

export default function MembresiasPage() {
  return (
    <main className="app-shell">
      <div className="app-container">

        <div className="page-header">
          <div>
            <h1 className="page-title">Membresías</h1>
            <p className="page-subtitle">
              Elige el plan que mejor se adapte a tu negocio.
            </p>
          </div>
        </div>

        <div className="grid-auto">

          <div className="card">
            <h3 className="card-title">Starter</h3>
            <p className="card-subtitle">Funciones básicas</p>
            <button className="btn btn-primary">Seleccionar</button>
          </div>

          <div className="card">
            <h3 className="card-title">Pro</h3>
            <p className="card-subtitle">Funciones avanzadas</p>
            <button className="btn btn-primary">Seleccionar</button>
          </div>

          <div className="card">
            <h3 className="card-title">Business</h3>
            <p className="card-subtitle">Todo desbloqueado</p>
            <button className="btn btn-primary">Seleccionar</button>
          </div>

        </div>

      </div>
    </main>
  );
}