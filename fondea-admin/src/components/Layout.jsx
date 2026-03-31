import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <h2>Fondea Admin</h2>
        
        <div className="menu-section">
          <div className="section-title">Principal</div>
          <ul>
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                🏠 Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/simulator" className={({ isActive }) => isActive ? 'active' : ''}>
                🧮 Simulador
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="menu-section">
          <div className="section-title">Productos</div>
          <ul>
            <li>
              <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
                📦 Productos
              </NavLink>
            </li>
            <li>
              <NavLink to="/product-amounts" className={({ isActive }) => isActive ? 'active' : ''}>
                💰 Montos
              </NavLink>
            </li>
            <li>
              <NavLink to="/product-terms" className={({ isActive }) => isActive ? 'active' : ''}>
                📅 Plazos
              </NavLink>
            </li>
            <li>
              <NavLink to="/product-installment-options" className={({ isActive }) => isActive ? 'active' : ''}>
                🔢 Cuotas
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="menu-section">
          <div className="section-title">Comisiones (Fees)</div>
          <ul>
            <li>
              <NavLink to="/fee-definitions" className={({ isActive }) => isActive ? 'active' : ''}>
                📋 Definiciones
              </NavLink>
            </li>
            <li>
              <NavLink to="/product-fee-configs" className={({ isActive }) => isActive ? 'active' : ''}>
                ⚙️ Configuración
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="menu-section">
          <div className="section-title">Descuentos</div>
          <ul>
            <li>
              <NavLink to="/discount-definitions" className={({ isActive }) => isActive ? 'active' : ''}>
                🎁 Definiciones
              </NavLink>
            </li>
            <li>
              <NavLink to="/product-discount-configs" className={({ isActive }) => isActive ? 'active' : ''}>
                🔧 Configuración
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
