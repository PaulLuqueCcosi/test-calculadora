import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

const menuPhases = [
  {
    phase: null,
    title: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: '🏠', end: true },
      { to: '/simulator', label: 'Simulador', icon: '🧮' },
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
      { to: '/product-fee-configs', label: 'Config. de Fees', icon: '⚙️' },
      { to: '/product-discount-configs', label: 'Config. de Descuentos', icon: '🔧' },
    ]
  },
];

function Layout() {
  const [collapsed, setCollapsed] = useState({});

  const togglePhase = (phase) => {
    setCollapsed(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🏦</span>
          <span className="brand-name">Fondea Admin</span>
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
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {item.label}
                    </NavLink>
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
