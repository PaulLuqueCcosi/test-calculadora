import { useState, useEffect } from 'react';
import { creditScoreRangeService, productService } from '../services/productService';
import './CrudPage.css';

function CreditScoreRanges() {
  const [ranges, setRanges] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    productId: '', code: '', label: '', minScore: '', maxScore: '', displayOrder: 0, isActive: true
  });
  const [filter, setFilter] = useState({ productId: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [rangesRes, productsRes] = await Promise.all([
        creditScoreRangeService.getAll(),
        productService.getAll()
      ]);
      setRanges(rangesRes.data);
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
        minScore: parseInt(formData.minScore),
        maxScore: parseInt(formData.maxScore),
        displayOrder: parseInt(formData.displayOrder)
      };
      if (editingId) {
        await creditScoreRangeService.update(editingId, payload);
      } else {
        await creditScoreRangeService.create(payload);
      }
      loadData();
      resetForm();
    } catch {
      alert('Error al guardar rango de score');
    }
  };

  const handleEdit = (range) => {
    setEditingId(range.id);
    setFormData({
      productId: range.productId,
      code: range.code,
      label: range.label,
      minScore: range.minScore,
      maxScore: range.maxScore,
      displayOrder: range.displayOrder,
      isActive: range.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este rango de score?')) {
      try {
        await creditScoreRangeService.delete(id);
        loadData();
      } catch {
        alert('Error al eliminar rango de score');
      }
    }
  };

  const resetForm = () => {
    setFormData({ productId: '', code: '', label: '', minScore: '', maxScore: '', displayOrder: 0, isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredRanges = ranges.filter(r => !filter.productId || r.productId === filter.productId);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Rangos de Score Crediticio</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : 'Nuevo Rango'}
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
              <label>Código:</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="Ej: ALTO"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Etiqueta:</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
                placeholder="Ej: Score Alto"
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
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Score Mínimo (0-1000):</label>
              <input
                type="number"
                min="0"
                max="1000"
                value={formData.minScore}
                onChange={(e) => setFormData({ ...formData, minScore: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Score Máximo (0-1000):</label>
              <input
                type="number"
                min="0"
                max="1000"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                required
              />
            </div>
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
            <button type="submit" className="btn-primary">{editingId ? 'Actualizar' : 'Crear'}</button>
            <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      <div className="filter-section">
        <div className="filter-row">
          <div className="form-group">
            <label>Filtrar por Producto:</label>
            <select
              value={filter.productId}
              onChange={(e) => setFilter({ productId: e.target.value })}
            >
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
              <th>Código</th>
              <th>Etiqueta</th>
              <th>Score Mín.</th>
              <th>Score Máx.</th>
              <th>Orden</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRanges.map((range) => (
              <tr key={range.id}>
                <td>{products.find(p => p.id === range.productId)?.name}</td>
                <td><code>{range.code}</code></td>
                <td>{range.label}</td>
                <td>{range.minScore}</td>
                <td>{range.maxScore}</td>
                <td>{range.displayOrder}</td>
                <td>
                  <span className={`badge ${range.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {range.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(range)} className="btn-edit">Editar</button>
                  <button onClick={() => handleDelete(range.id)} className="btn-delete">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CreditScoreRanges;
