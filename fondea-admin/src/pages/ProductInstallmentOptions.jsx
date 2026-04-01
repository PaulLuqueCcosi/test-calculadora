import { useState, useEffect } from 'react';
import { productInstallmentOptionService, productService } from '../services/productService';
import './CrudPage.css';

function ProductInstallmentOptions() {
  const [options, setOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    installmentCount: '',
    label: '',
    displayOrder: 0,
  });
  const [filter, setFilter] = useState({ productId: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [optionsRes, productsRes] = await Promise.all([
        productInstallmentOptionService.getAll(),
        productService.getAll(),
      ]);
      setOptions(optionsRes.data);
      setProducts(productsRes.data);
    } catch {
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        installmentCount: parseInt(formData.installmentCount),
        displayOrder: parseInt(formData.displayOrder),
      };
      if (editingId) {
        await productInstallmentOptionService.update(editingId, payload);
      } else {
        await productInstallmentOptionService.create(payload);
      }
      loadData();
      resetForm();
    } catch {
      alert('Error al guardar opción de cuotas');
    }
  };

  const handleEdit = (option) => {
    setEditingId(option.id);
    setFormData({
      productId: option.productId,
      installmentCount: option.installmentCount,
      label: option.label,
      displayOrder: option.displayOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta opción de cuotas?')) {
      try {
        await productInstallmentOptionService.delete(id);
        loadData();
      } catch {
        alert('Error al eliminar opción de cuotas');
      }
    }
  };

  const resetForm = () => {
    setFormData({ productId: '', installmentCount: '', label: '', displayOrder: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredOptions = options.filter(opt => !filter.productId || opt.productId === filter.productId);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Opciones de Cuotas</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : 'Nueva Opción'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Producto:</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
              >
                <option value="">Seleccionar producto</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Número de Cuotas:</label>
              <input type="number" min="1" value={formData.installmentCount}
                onChange={(e) => setFormData({ ...formData, installmentCount: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Etiqueta:</label>
              <input type="text" value={formData.label} maxLength={50}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Orden:</label>
              <input type="number" min="0" value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">{editingId ? 'Actualizar' : 'Crear'}</button>
            <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      <div className="filter-section">
        <div className="filter-row">
          <div className="form-group">
            <label>Filtrar por Producto:</label>
            <select value={filter.productId} onChange={(e) => setFilter({ productId: e.target.value })}>
              <option value="">Todos</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cuotas</th>
              <th>Etiqueta</th>
              <th>Orden</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOptions.map((opt) => (
              <tr key={opt.id}>
                <td>{opt.productName || products.find(p => p.id === opt.productId)?.name}</td>
                <td>{opt.installmentCount}</td>
                <td>{opt.label}</td>
                <td>{opt.displayOrder}</td>
                <td>
                  <span className={`badge ${opt.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {opt.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(opt)} className="btn-edit">Editar</button>
                  <button onClick={() => handleDelete(opt.id)} className="btn-delete">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductInstallmentOptions;
