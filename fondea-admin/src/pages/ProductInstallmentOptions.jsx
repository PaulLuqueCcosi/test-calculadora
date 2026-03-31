import { useState, useEffect } from 'react';
import { productInstallmentOptionService, productService, productAmountService, productTermService, creditScoreRangeService } from '../services/productService';
import './CrudPage.css';
import './ConfigPage.css';

function ProductInstallmentOptions() {
  const [options, setOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [terms, setTerms] = useState([]);
  const [scoreRanges, setScoreRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    installmentCount: '',
    label: '',
    displayOrder: 0,
    restrictedToAmountIds: [],
    restrictedToTermIds: [],
    restrictedToCreditScoreRangeIds: []
  });
  const [filter, setFilter] = useState({ productId: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [optionsRes, productsRes, amountsRes, termsRes, scoresRes] = await Promise.all([
        productInstallmentOptionService.getAll(),
        productService.getAll(),
        productAmountService.getAll(),
        productTermService.getAll(),
        creditScoreRangeService.getAll()
      ]);
      setOptions(optionsRes.data);
      setProducts(productsRes.data);
      setAmounts(amountsRes.data);
      setTerms(termsRes.data);
      setScoreRanges(scoresRes.data);
    } catch {
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.productId) {
      if (getProductAmounts().length > 0 && formData.restrictedToAmountIds.length === 0)
        return alert('Debes seleccionar al menos un monto restringido.');
      if (getProductTerms().length > 0 && formData.restrictedToTermIds.length === 0)
        return alert('Debes seleccionar al menos un plazo restringido.');
      if (getProductScoreRanges().length > 0 && formData.restrictedToCreditScoreRangeIds.length === 0)
        return alert('Debes seleccionar al menos un rango de score restringido.');
    }
    try {
      const payload = {
        ...formData,
        installmentCount: parseInt(formData.installmentCount),
        displayOrder: parseInt(formData.displayOrder)
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
    // Map back from response values to IDs
    const amountIds = option.restrictedToAmounts?.map(val => {
      const a = amounts.find(am => am.amount === val && am.productId === option.productId);
      return a?.id;
    }).filter(Boolean) || [];
    const termIds = option.restrictedToTerms?.map(val => {
      const t = terms.find(tm => tm.termDays === val && tm.productId === option.productId);
      return t?.id;
    }).filter(Boolean) || [];
    const scoreIds = option.restrictedToCreditScoreRanges?.map(r => r.id).filter(Boolean) || [];

    setFormData({
      productId: option.productId,
      installmentCount: option.installmentCount,
      label: option.label,
      displayOrder: option.displayOrder,
      restrictedToAmountIds: amountIds,
      restrictedToTermIds: termIds,
      restrictedToCreditScoreRangeIds: scoreIds
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
    setFormData({ productId: '', installmentCount: '', label: '', displayOrder: 0, restrictedToAmountIds: [], restrictedToTermIds: [], restrictedToCreditScoreRangeIds: [] });
    setEditingId(null);
    setShowForm(false);
  };

  const getProductAmounts = () => amounts.filter(a => a.productId === formData.productId && a.isActive);
  const getProductTerms = () => terms.filter(t => t.productId === formData.productId && t.isActive);
  const getProductScoreRanges = () => scoreRanges.filter(r => r.productId === formData.productId && r.isActive);

  const toggle = (field, id) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(x => x !== id) : [...prev[field], id]
    }));
  };

  const selectAll = (field, items) => setFormData(prev => ({ ...prev, [field]: items.map(i => i.id) }));
  const clearAll = (field) => setFormData(prev => ({ ...prev, [field]: [] }));

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
                onChange={(e) => setFormData({ ...formData, productId: e.target.value, restrictedToAmountIds: [], restrictedToTermIds: [], restrictedToCreditScoreRangeIds: [] })}
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

          {formData.productId && (
            <>
              <SelectionSection
                title="Montos Restringidos"
                items={getProductAmounts()}
                selectedIds={formData.restrictedToAmountIds}
                onToggle={(id) => toggle('restrictedToAmountIds', id)}
                onSelectAll={() => selectAll('restrictedToAmountIds', getProductAmounts())}
                onClear={() => clearAll('restrictedToAmountIds')}
                renderLabel={(a) => `$${a.amount.toFixed(2)}`}
                emptyMsg="No hay montos activos para este producto"
                errorMsg="Debes seleccionar al menos un monto"
              />
              <SelectionSection
                title="Plazos Restringidos"
                items={getProductTerms()}
                selectedIds={formData.restrictedToTermIds}
                onToggle={(id) => toggle('restrictedToTermIds', id)}
                onSelectAll={() => selectAll('restrictedToTermIds', getProductTerms())}
                onClear={() => clearAll('restrictedToTermIds')}
                renderLabel={(t) => t.label}
                emptyMsg="No hay plazos activos para este producto"
                errorMsg="Debes seleccionar al menos un plazo"
              />
              <SelectionSection
                title="Rangos de Score Crediticio Restringidos"
                items={getProductScoreRanges()}
                selectedIds={formData.restrictedToCreditScoreRangeIds}
                onToggle={(id) => toggle('restrictedToCreditScoreRangeIds', id)}
                onSelectAll={() => selectAll('restrictedToCreditScoreRangeIds', getProductScoreRanges())}
                onClear={() => clearAll('restrictedToCreditScoreRangeIds')}
                renderLabel={(r) => `${r.label} (${r.minScore}-${r.maxScore})`}
                emptyMsg="No hay rangos de score activos para este producto"
                errorMsg="Debes seleccionar al menos un rango de score"
              />
            </>
          )}

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
              <th>Montos</th>
              <th>Plazos</th>
              <th>Score Ranges</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOptions.map((opt) => (
              <tr key={opt.id}>
                <td>{products.find(p => p.id === opt.productId)?.name}</td>
                <td>{opt.installmentCount}</td>
                <td>{opt.label}</td>
                <td>{opt.displayOrder}</td>
                <td>
                  {!opt.restrictedToAmounts?.length
                    ? <span className="badge badge-warning">Sin configurar</span>
                    : <div className="tags-container">{opt.restrictedToAmounts.map((v, i) => <span key={i} className="tag">${v}</span>)}</div>
                  }
                </td>
                <td>
                  {!opt.restrictedToTerms?.length
                    ? <span className="badge badge-warning">Sin configurar</span>
                    : <div className="tags-container">{opt.restrictedToTerms.map((v, i) => <span key={i} className="tag">{v}d</span>)}</div>
                  }
                </td>
                <td>
                  {!opt.restrictedToCreditScoreRanges?.length
                    ? <span className="badge badge-warning">Sin configurar</span>
                    : <div className="tags-container">{opt.restrictedToCreditScoreRanges.map((r) => <span key={r.id} className="tag">{r.label}</span>)}</div>
                  }
                </td>
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

function SelectionSection({ title, items, selectedIds, onToggle, onSelectAll, onClear, renderLabel, emptyMsg, errorMsg }) {
  return (
    <div className="selection-section">
      <div className="section-header">
        <label>{title}:</label>
        <div className="selection-actions">
          <button type="button" onClick={onSelectAll} className="btn-link">Seleccionar todos</button>
          <button type="button" onClick={onClear} className="btn-link">Limpiar</button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="empty-message">{emptyMsg}</div>
      ) : (
        <>
          <div className="checkbox-grid">
            {items.map(item => (
              <label key={item.id} className="checkbox-card">
                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => onToggle(item.id)} />
                <span className="checkbox-label">{renderLabel(item)}</span>
              </label>
            ))}
          </div>
          {selectedIds.length === 0 && <div className="error-message">⚠️ {errorMsg}</div>}
        </>
      )}
    </div>
  );
}

export default ProductInstallmentOptions;
