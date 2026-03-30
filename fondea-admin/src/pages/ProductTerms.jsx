import { useState, useEffect } from 'react';
import { productTermService, productService } from '../services/productService';
import './CrudPage.css';

function ProductTerms() {
  const [terms, setTerms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    productId: '', 
    termDays: '', 
    label: '', 
    displayOrder: 0 
  });
  const [filter, setFilter] = useState({ productId: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [termsRes, productsRes] = await Promise.all([
        productTermService.getAll(),
        productService.getAll()
      ]);
      setTerms(termsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productTermService.update(editingId, formData);
      } else {
        await productTermService.create(formData);
      }
      loadData();
      resetForm();
    } catch (error) {
      alert('Error al guardar plazo');
    }
  };

  const handleEdit = (term) => {
    setEditingId(term.id);
    setFormData({ 
      productId: term.productId, 
      termDays: term.termDays, 
      label: term.label,
      displayOrder: term.displayOrder
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este plazo?')) {
      try {
        await productTermService.delete(id);
        loadData();
      } catch (error) {
        alert('Error al eliminar plazo');
      }
    }
  };

  const resetForm = () => {
    setFormData({ productId: '', termDays: '', label: '', displayOrder: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredTerms = terms.filter(term => 
    !filter.productId || term.productId === filter.productId
  );

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Plazos de Productos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : 'Nuevo Plazo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Producto:</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              <option value="">Seleccionar producto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Días:</label>
            <input
              type="number"
              min="1"
              value={formData.termDays}
              onChange={(e) => setFormData({ ...formData, termDays: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Etiqueta:</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              maxLength={50}
            />
          </div>
          <div className="form-group">
            <label>Orden:</label>
            <input
              type="number"
              min="0"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="filter-section">
        <div className="filter-row">
          <div className="form-group">
            <label>Filtrar por Producto:</label>
            <select
              value={filter.productId}
              onChange={(e) => setFilter({ ...filter, productId: e.target.value })}
            >
              <option value="">Todos</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Días</th>
              <th>Etiqueta</th>
              <th>Orden</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTerms.map((term) => (
              <tr key={term.id}>
                <td>{products.find(p => p.id === term.productId)?.name}</td>
                <td>{term.termDays}</td>
                <td>{term.label}</td>
                <td>{term.displayOrder}</td>
                <td>
                  <span className={`badge ${term.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {term.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(term)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(term.id)} className="btn-delete">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTerms;
