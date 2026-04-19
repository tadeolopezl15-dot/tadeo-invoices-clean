export default function AdminPage() {
  return (
    <main className="app-shell">
      <div className="app-container">

        <div className="page-header">
          <div>
            <h1 className="page-title">Admin</h1>
            <p className="page-subtitle">
              Control total del sistema.
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Usuarios</h3>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>123</td>
                  <td>Pro</td>
                  <td>Active</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </main>
  );
}