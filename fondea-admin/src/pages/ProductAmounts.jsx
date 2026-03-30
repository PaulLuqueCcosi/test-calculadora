import { useState, useEffect } from 'react';
import { productAmountService } from '../services/productService';
import { productService } from '../services/productService';
import './CrudPage.css';

function ProductAmounts() {
  const [amounts, setAmounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ productId: '', amount: '', isActive: true });
  const [filter, setFilter] = useState({ productId: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [amountsRes, productsRes] = await Promise.all([
        productAmountService.getAll(),
        productService.getAll()
      ]);
      setAmounts(amountsRes.data);
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
        await productAmountService.update(editingId, formData);
      } else {
        await productAmountService.create(formData);
      }
      loadData();
      resetForm();
    } catch (error) {
      alert('Error al guardar monto');
    }
  };

  const handleEdit = (amount) => {
    setEditingId(amount.id);
    setFormData({ 
      productId: amount.productId, 
      amount: amount.amount, 
      isActive: amount.isActive 
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este monto?')) {
      try {
        await productAmountService.delete(id);
        loadData();
      } catch (error) {
        alert('Error al eliminar monto');
      }
    }
  };

  const resetForm = () => {
    setFormData({ productId: '', amount: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredAmounts = amounts.filter(amount => 
    !filter.productId || amount.productId === filter.productId
  );

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Montos de Productos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : 'Nuevo Monto'}
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
            <label>Monto:</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              {' '}Activo
            </label>
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
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAmounts.map((amount) => (
              <tr key={amount.id}>
                <td>{amount.productName}</td>
                <td>${amount.amount.toFixed(2)}</td>
                <td>
                  <span className={`badge ${amount.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {amount.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(amount)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(amount.id)} className="btn-delete">
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

export default ProductAmounts;
