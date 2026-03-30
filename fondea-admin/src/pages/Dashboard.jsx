import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const sections = [
    { title: 'Productos', path: '/products', icon: '📦', description: 'Gestionar productos de préstamo' },
    { title: 'Montos', path: '/product-amounts', icon: '💰', description: 'Configurar montos disponibles' },
    { title: 'Plazos', path: '/product-terms', icon: '📅', description: 'Definir plazos de pago' },
    { title: 'Definiciones Fee', path: '/fee-definitions', icon: '💳', description: 'Crear tipos de comisiones' },
    { title: 'Config Fee', path: '/product-fee-configs', icon: '⚙️', description: 'Configurar fees por producto' },
    { title: 'Definiciones Descuento', path: '/discount-definitions', icon: '🎁', description: 'Crear tipos de descuentos' },
    { title: 'Config Descuento', path: '/product-discount-configs', icon: '🔧', description: 'Configurar descuentos por producto' },
    { title: 'Simulador', path: '/simulator', icon: '🧮', description: 'Simular préstamos' },
  ];

  return (
    <div className="dashboard">
      <h1>Panel de Administración Fondea</h1>
      <p className="dashboard-subtitle">Gestiona productos, comisiones, descuentos y simula préstamos</p>
      
      <div className="dashboard-grid">
        {sections.map((section) => (
          <Link key={section.path} to={section.path} className="dashboard-card">
            <div className="card-icon">{section.icon}</div>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
