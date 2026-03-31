import { Link } from 'react-router-dom';
import './Dashboard.css';

const PHASES = [
  {
    phase: 1,
    title: 'Catálogo Global',
    description: 'Crea las definiciones de fees y descuentos. Se hace una sola vez y se reutilizan en todos los productos.',
    color: '#8e24aa',
    links: [
      { to: '/fee-definitions', label: 'Definiciones de Fees', icon: '💳' },
      { to: '/discount-definitions', label: 'Definiciones de Descuentos', icon: '🎁' },
    ]
  },
  {
    phase: 2,
    title: 'Crear Producto',
    description: 'Define el producto base. Todo lo demás depende de él.',
    color: '#1e88e5',
    links: [
      { to: '/products', label: 'Productos', icon: '📦' },
    ]
  },
  {
    phase: 3,
    title: 'Dimensiones del Producto',
    description: 'Configura los montos, plazos y rangos de score. Luego crea las opciones de cuotas que combinan estas tres dimensiones.',
    color: '#2e7d32',
    links: [
      { to: '/product-amounts', label: 'Montos', icon: '💰' },
      { to: '/product-terms', label: 'Plazos', icon: '📅' },
      { to: '/credit-score-ranges', label: 'Score Crediticio', icon: '📊' },
      { to: '/product-installment-options', label: 'Opciones de Cuotas', icon: '🔢' },
    ]
  },
  {
    phase: 4,
    title: 'Fees y Descuentos por Producto',
    description: 'Asocia fees y descuentos al producto, especificando a qué montos, plazos, cuotas y scores aplica cada uno.',
    color: '#e65100',
    links: [
      { to: '/product-fee-configs', label: 'Config. de Fees', icon: '⚙️' },
      { to: '/product-discount-configs', label: 'Config. de Descuentos', icon: '🔧' },
    ]
  },
  {
    phase: 5,
    title: 'Simular',
    description: 'Con todo configurado, usa el simulador para probar combinaciones de monto, plazo, cuotas y score crediticio.',
    color: '#00838f',
    links: [
      { to: '/simulator', label: 'Simulador de Préstamos', icon: '🧮' },
    ]
  },
];

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Administración Fondea</h1>
        <p className="dashboard-subtitle">Sigue los pasos para configurar un producto desde cero</p>
      </div>

      <div className="phases-list">
        {PHASES.map((p, idx) => (
          <div key={p.phase} className="phase-card" style={{ '--phase-color': p.color }}>
            <div className="phase-card__header">
              <div className="phase-number" style={{ background: p.color }}>
                {p.phase}
              </div>
              <div className="phase-card__info">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            </div>
            <div className="phase-card__links">
              {p.links.map(link => (
                <Link key={link.to} to={link.to} className="phase-link">
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
            {idx < PHASES.length - 1 && <div className="phase-arrow">↓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
