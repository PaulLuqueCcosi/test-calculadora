import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <h2>Fondea Admin</h2>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/products">Productos</Link></li>
          <li><Link to="/product-amounts">Montos</Link></li>
          <li><Link to="/product-terms">Plazos</Link></li>
          <li><Link to="/fee-definitions">Definiciones Fee</Link></li>
          <li><Link to="/product-fee-configs">Config Fee</Link></li>
          <li><Link to="/discount-definitions">Definiciones Descuento</Link></li>
          <li><Link to="/product-discount-configs">Config Descuento</Link></li>
          <li><Link to="/simulator">Simulador</Link></li>
        </ul>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
