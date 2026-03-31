import { useState, useEffect } from 'react';
import { creditScoreRangeService, productService } from '../services/productService';
import './CrudPage.css';
import './ConfigPage.css';

const PRESET_COLORS = [
  { label: 'Rojo', value: '#e53935' },
  { label: 'Naranja', value: '#fb8c00' },
  { label: 'Amarillo', value: '#fdd835' },
  { label: 'Verde claro', value: '#7cb342' },
  { label: 'Verde', value: '#2e7d32' },
  { label: 'Azul', value: '#1e88e5' },
  { label: 'Morado', value: '#8e24aa' },
  { label: 'Gris', value: '#757575' },
];

const EMPTY_FORM = {
  productId: '', code: '', label: '', color: '#1e88e5',
  minScore: '', maxScore: '', displayOrder: 0, isActive: true
};

function CreditScoreRanges() {
  const [ranges, setRanges] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
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

  const scoreError = () => {
    const min = parseInt(formData.minScore);
    const max = parseInt(formData.maxScore);
    if (formData.minScore !== '' && formData.maxScore !== '' && min >= max)
      return 'El score mínimo debe ser menor que el máximo';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = scoreError();
    if (err) return alert(err);
    try {
      const payload = {
        productId: formData.productId,
        code: formData.code,
        label: formData.label,
        color: formData.color,
        minScore: parseInt(formData.minScore),
        maxScore: parseInt(formData.maxScore),
        displayOrder: parseInt(formData.displayOrder),
        isActive: formData.isActive
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
      color: range.color || '#1e88e5',
      minScore: range.minScore,
      maxScore: range.maxScore,
      displayOrder: range.displayOrder,
      isActive: range.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Eliminar este rango de score?')) {
      try {
        await creditScoreRangeService.delete(id);
        loadData();
      } catch {
        alert('Error al eliminar rango de score');
      }
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const filteredRanges = ranges.filter(r => !filter.productId || r.productId === filter.productId);
  const err = scoreError();

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
              <select value={formData.productId} onChange={(e) => set('productId', e.target.value)} required>
                <option value="">Seleccionar producto</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Código:</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                required
                placeholder="Ej: SCORE_ALTO"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Etiqueta:</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => set('label', e.target.value)}
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
                onChange={(e) => set('displayOrder', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Score Mínimo (0-999):</label>
              <input
                type="number"
                min="0"
                max="999"
                value={formData.minScore}
                onChange={(e) => set('minScore', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Score Máximo (1-1000):</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.maxScore}
                onChange={(e) => set('maxScore', e.target.value)}
                required
              />
            </div>
          </div>

          {err && <div className="error-message">⚠️ {err}</div>}

          <div className="form-group">
            <label>Color identificador:</label>
            <div className="color-picker-row">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  className={`color-swatch${formData.color === c.value ? ' color-swatch--selected' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => set('color', c.value)}
                />
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => set('color', e.target.value)}
                title="Color personalizado"
                className="color-input-custom"
              />
              <span
                className="color-preview"
                style={{ background: formData.color + '22', color: formData.color, borderColor: formData.color }}
              >
                {formData.label || 'Vista previa'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
              />
              {' '}Activo
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={!!err}>
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
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
              <th>Rango</th>
              <th>Código</th>
              <th>Score</th>
              <th>Orden</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRanges.map((range) => {
              const color = range.color || '#757575';
              return (
                <tr key={range.id}>
                  <td>{products.find(p => p.id === range.productId)?.name}</td>
                  <td>
                    <span className="score-range-pill" style={{ background: color + '22', color, borderColor: color }}>
                      {range.label}
                    </span>
                  </td>
                  <td>
                    <span className="score-badge" style={{ background: color + '22', color, borderColor: color }}>
                      {range.code}
                    </span>
                  </td>
                  <td>
                    <span className="score-range-pill" style={{ background: color + '22', color, borderColor: color }}>
                      {range.minScore} &ndash; {range.maxScore}
                    </span>
                  </td>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CreditScoreRanges;
