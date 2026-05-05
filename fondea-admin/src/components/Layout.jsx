import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { getToken, setToken } from '../config/api';
import './Layout.css';

const menuPhases = [
  {
    phase: null,
    title: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: '🏠', end: true },
      { to: '/simulator', label: 'Simulador', icon: '🧮' },
      { to: '/landing-contacts', label: 'Envíos Contacto', icon: '📨' },
      { href: import.meta.env.VITE_CALCULATOR_URL, label: 'Calculadora', icon: '🔗', external: true },
    ]
  },
  {
    phase: 1,
    title: 'Catálogo Global',
    hint: 'Una sola vez por sistema',
    items: [
      { to: '/fee-definitions', label: 'Definiciones de Fees', icon: '💳' },
      { to: '/discount-definitions', label: 'Definiciones de Descuentos', icon: '🎁' },
    ]
  },
  {
    phase: 2,
    title: 'Productos',
    hint: 'Crear el producto base',
    items: [
      { to: '/products', label: 'Productos', icon: '📦' },
    ]
  },
  {
    phase: 3,
    title: 'Dimensiones del Producto',
    hint: 'Montos, plazos, scores y cuotas',
    items: [
      { to: '/product-amounts', label: 'Montos', icon: '💰' },
      { to: '/product-terms', label: 'Plazos', icon: '📅' },
      { to: '/credit-score-ranges', label: 'Score Crediticio', icon: '📊' },
      { to: '/product-installment-options', label: 'Opciones de Cuotas', icon: '🔢' },
    ]
  },
  {
    phase: 4,
    title: 'Fees y Descuentos',
    hint: 'Configurar por producto',
    items: [
      { to: '/product-fee-groups', label: 'Grupos de Comisiones', icon: '⚙️' },
      { to: '/product-fee-configs', label: 'Fee Configs (detalle)', icon: '🔍' },
      { to: '/product-discount-configs', label: 'Config. de Descuentos', icon: '🔧' },
    ]
  },
];

function Layout() {
  const [collapsed, setCollapsed] = useState({});
  const [tokenInput, setTokenInput] = useState(getToken() || '');
  const [showToken, setShowToken] = useState(false);

  const togglePhase = (phase) => {
    setCollapsed(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  const handleTokenSave = () => {
    setToken(tokenInput.trim());
  };

  const handleTokenClear = () => {
    setTokenInput('');
    setToken(null);
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🏦</span>
          <span className="brand-name">Fondea Admin</span>
        </div>

        <div className="token-section">
          <div className="token-header" onClick={() => setShowToken(!showToken)} style={{ cursor: 'pointer' }}>
            <span>{getToken() ? '🔒' : '🔓'} Token API</span>
            <span className="section-toggle">{showToken ? '▾' : '▸'}</span>
          </div>
          {showToken && (
            <div className="token-body">
              <input
                type="password"
                placeholder="Pegar token aquí..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="token-input"
              />
              <div className="token-actions">
                <button onClick={handleTokenSave} className="token-btn token-btn--save">Guardar</button>
                <button onClick={handleTokenClear} className="token-btn token-btn--clear">Limpiar</button>
              </div>
              {getToken() && <span className="token-status">✅ Token guardado</span>}
            </div>
          )}
        </div>

        {menuPhases.map((section) => (
          <div key={section.title} className="menu-section">
            <div
              className={`section-title ${section.phase ? 'section-title--phase' : ''}`}
              onClick={section.phase ? () => togglePhase(section.phase) : undefined}
              style={section.phase ? { cursor: 'pointer' } : {}}
            >
              {section.phase && (
                <span className="phase-badge">Fase {section.phase}</span>
              )}
              <span className="section-label">{section.title}</span>
              {section.phase && (
                <span className="section-toggle">{collapsed[section.phase] ? '▸' : '▾'}</span>
              )}
            </div>
            {section.hint && !collapsed[section.phase] && (
              <div className="section-hint">{section.hint}</div>
            )}
            {!collapsed[section.phase] && (
              <ul>
                {section.items.map(item => (
                  <li key={item.to || item.href}>
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                      </a>
                    ) : (
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => isActive ? 'active' : ''}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
