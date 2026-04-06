import { useState, useEffect } from 'react';
import { productFeeGroupService, feeDefinitionService } from '../services/feeService';
import { productService, productAmountService, productTermService, productInstallmentOptionService, creditScoreRangeService } from '../services/productService';
import './CrudPage.css';
import './ConfigPage.css';

const CALCULATION_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];

const emptyForm = {
  productId: '',
  name: '',
  calculationType: 'PERCENTAGE',
  value: '',
  isActive: true,
  splits: [],
  applicableAmountIds: [],
  applicableTermIds: [],
  applicableInstallmentIds: [],
  applicableCreditScoreRangeIds: [],
};

function ProductFeeGroups() {
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [feeDefs, setFeeDefs] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [terms, setTerms] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [scoreRanges, setScoreRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [filterProductId, setFilterProductId] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [groupsRes, productsRes, feesRes] = await Promise.all([
        productFeeGroupService.getAll(),
        productService.getAll(),
        feeDefinitionService.getAll(),
      ]);
      setGroups(groupsRes.data);
      setProducts(productsRes.data);
      setFeeDefs(feesRes.data);
    } catch {
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadProductDimensions = async (productId) => {
    if (!productId) {
      setAmounts([]); setTerms([]); setInstallments([]); setScoreRanges([]);
      return;
    }
    try {
      const [a, t, i, s] = await Promise.all([
        productAmountService.getByProduct(productId),
        productTermService.getByProduct(productId),
        productInstallmentOptionService.getByProduct(productId),
        creditScoreRangeService.getByProduct(productId),
      ]);
      setAmounts(a.data);
      setTerms(t.data);
      setInstallments(i.data);
      setScoreRanges(s.data);
      return { amounts: a.data, terms: t.data, installments: i.data, scoreRanges: s.data };
    } catch {
      alert('Error al cargar dimensiones del producto');
    }
  };

  const handleProductChange = (productId) => {
    setFormData({ ...emptyForm, productId, splits: [] });
    loadProductDimensions(productId);
  };

  // --- Splits ---
  const addSplit = () => {
    setFormData(prev => ({
      ...prev,
      splits: [...prev.splits, { feeDefinitionCode: '', percentage: '', displayOrder: prev.splits.length + 1 }],
    }));
  };

  const removeSplit = (idx) => {
    setFormData(prev => ({
      ...prev,
      splits: prev.splits.filter((_, i) => i !== idx).map((s, i) => ({ ...s, displayOrder: i + 1 })),
    }));
  };

  const updateSplit = (idx, field, value) => {
    setFormData(prev => {
      const splits = [...prev.splits];
      splits[idx] = { ...splits[idx], [field]: value };
      return { ...prev, splits };
    });
  };

  const splitsTotal = formData.splits.reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);

  // --- Dimension toggles ---
  const toggle = (field, id) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(x => x !== id) : [...prev[field], id],
    }));
  };

  const selectAll = (field, items) => setFormData(prev => ({ ...prev, [field]: items.map(i => i.id) }));
  const clearAll = (field) => setFormData(prev => ({ ...prev, [field]: [] }));

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.splits.length === 0) return alert('Debes agregar al menos un split.');
    if (Math.abs(splitsTotal - 100) > 0.01) return alert(`Los splits deben sumar 100%. Actualmente suman ${splitsTotal.toFixed(2)}%.`);

    const payload = {
      ...formData,
      value: parseFloat(formData.value),
      splits: formData.splits.map(s => ({ ...s, percentage: parseFloat(s.percentage), displayOrder: parseInt(s.displayOrder) })),
    };

    try {
      if (editingId) {
        await productFeeGroupService.update(editingId, payload);
      } else {
        await productFeeGroupService.create(payload);
      }
      loadData();
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar grupo';
      alert(msg);
    }
  };

  const handleEdit = async (group) => {
    setEditingId(group.id);
    const dims = await loadProductDimensions(group.productId);
    const a = dims?.amounts || [];
    const t = dims?.terms || [];
    const inst = dims?.installments || [];
    const sr = dims?.scoreRanges || [];

    setFormData({
      productId: group.productId,
      name: group.name,
      calculationType: group.calculationType,
      value: group.value,
      isActive: group.isActive,
      splits: group.splits.map(s => ({
        feeDefinitionCode: s.feeDefinitionCode,
        percentage: s.percentage,
        displayOrder: s.displayOrder,
      })),
      applicableAmountIds: group.applicableAmounts?.map(ao => a.find(x => x.amount === ao.value)?.id).filter(Boolean) || [],
      applicableTermIds: group.applicableTerms?.map(to => t.find(x => x.termDays === to.value)?.id).filter(Boolean) || [],
      applicableInstallmentIds: group.applicableInstallments?.map(io => inst.find(x => x.installmentCount === io.value)?.id).filter(Boolean) || [],
      applicableCreditScoreRangeIds: group.applicableCreditScoreRanges?.map(ro => sr.find(x => x.id === ro.id)?.id).filter(Boolean) || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este grupo y todos sus fee configs hijos?')) return;
    try {
      await productFeeGroupService.delete(id);
      loadData();
    } catch {
      alert('Error al eliminar grupo');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setAmounts([]); setTerms([]); setInstallments([]); setScoreRanges([]);
  };

  const filteredGroups = groups.filter(g => !filterProductId || g.productId === filterProductId);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Grupos de Comisiones (Fee Groups)</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">
          {showForm ? 'Cancelar' : 'Nuevo Grupo'}
        </button>
      </div>

      <div className="info-banner">
        💡 Un grupo define el valor total de comisión y lo distribuye en splits por fee definition. El sistema genera automáticamente los ProductFeeConfig hijos.
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Producto:</label>
              <select value={formData.productId} onChange={(e) => handleProductChange(e.target.value)} required>
                <option value="">Seleccionar producto</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Nombre del grupo:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
                placeholder="Ej: Comisión General"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Cálculo:</label>
              <select value={formData.calculationType} onChange={(e) => setFormData({ ...formData, calculationType: e.target.value })} required>
                {CALCULATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Valor total del grupo {formData.calculationType === 'PERCENTAGE' ? '(%)' : '(monto fijo)'}:</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
                placeholder="Ej: 20"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
              {' '}Activo
            </label>
          </div>

          {/* Splits */}
          <div className="selection-section">
            <div className="section-header">
              <label>Splits (distribución del valor total — deben sumar 100%)</label>
              <button type="button" onClick={addSplit} className="btn-link">+ Agregar split</button>
            </div>
            {formData.splits.length === 0 && (
              <div className="empty-message">No hay splits. Agrega al menos uno.</div>
            )}
            {formData.splits.map((split, idx) => (
              <div key={idx} className="split-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Fee Definition:</label>
                  <select value={split.feeDefinitionCode} onChange={(e) => updateSplit(idx, 'feeDefinitionCode', e.target.value)} required>
                    <option value="">Seleccionar fee</option>
                    {feeDefs.map(f => <option key={f.code} value={f.code}>{f.name} ({f.code})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Porcentaje del grupo (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100"
                    value={split.percentage}
                    onChange={(e) => updateSplit(idx, 'percentage', e.target.value)}
                    required
                    placeholder="Ej: 30"
                  />
                </div>
                <button type="button" onClick={() => removeSplit(idx)} className="btn-delete" style={{ alignSelf: 'flex-end', marginBottom: '4px' }}>✕</button>
              </div>
            ))}
            {formData.splits.length > 0 && (
              <div className={`splits-total ${Math.abs(splitsTotal - 100) < 0.01 ? 'splits-total--ok' : 'splits-total--error'}`}>
                Total: {splitsTotal.toFixed(2)}% {Math.abs(splitsTotal - 100) < 0.01 ? '✓' : `(faltan ${(100 - splitsTotal).toFixed(2)}%)`}
              </div>
            )}
          </div>

          {/* Dimensiones aplicables */}
          {formData.productId && (
            <>
              {[
                { label: 'Montos Aplicables', field: 'applicableAmountIds', items: amounts, render: (a) => `$${a.amount.toFixed(2)}` },
                { label: 'Plazos Aplicables', field: 'applicableTermIds', items: terms, render: (t) => t.label },
                { label: 'Cuotas Aplicables', field: 'applicableInstallmentIds', items: installments, render: (i) => i.label },
                { label: 'Rangos de Score', field: 'applicableCreditScoreRangeIds', items: scoreRanges, render: (r) => `${r.label} (${r.minScore}-${r.maxScore})` },
              ].map(({ label, field, items, render }) => (
                <div key={field} className="selection-section">
                  <div className="section-header">
                    <label>{label}:</label>
                    <div className="selection-actions">
                      <button type="button" onClick={() => selectAll(field, items)} className="btn-link">Todos</button>
                      <button type="button" onClick={() => clearAll(field)} className="btn-link">Limpiar</button>
                    </div>
                  </div>
                  {items.length === 0 ? (
                    <div className="empty-message">No hay {label.toLowerCase()} para este producto</div>
                  ) : (
                    <div className="checkbox-grid">
                      {items.map(item => (
                        <label key={item.id} className="checkbox-card">
                          <input
                            type="checkbox"
                            checked={formData[field].includes(item.id)}
                            onChange={() => toggle(field, item.id)}
                          />
                          <span className="checkbox-label">{render(item)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">{editingId ? 'Actualizar' : 'Crear Grupo'}</button>
            <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {/* Filtro */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="form-group">
            <label>Filtrar por Producto:</label>
            <select value={filterProductId} onChange={(e) => setFilterProductId(e.target.value)}>
              <option value="">Todos</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Splits</th>
              <th>Montos</th>
              <th>Plazos</th>
              <th>Cuotas</th>
              <th>Score</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map(group => (
              <tr key={group.id}>
                <td>{group.productName}</td>
                <td>{group.name}</td>
                <td>{group.calculationType}</td>
                <td>{group.calculationType === 'PERCENTAGE' ? `${group.value}%` : `$${group.value}`}</td>
                <td>
                  <div className="tags-container">
                    {group.splits?.map((s, i) => (
                      <span key={i} className="tag">{s.feeDefinitionCode} {s.percentage}%</span>
                    ))}
                  </div>
                </td>
                <td>
                  {!group.applicableAmounts?.length ? <span className="badge badge-warning">Todos</span> :
                    <div className="tags-container">{group.applicableAmounts.map((a, i) => <span key={i} className="tag">${a.value}</span>)}</div>}
                </td>
                <td>
                  {!group.applicableTerms?.length ? <span className="badge badge-warning">Todos</span> :
                    <div className="tags-container">{group.applicableTerms.map((t, i) => <span key={i} className="tag">{t.label}</span>)}</div>}
                </td>
                <td>
                  {!group.applicableInstallments?.length ? <span className="badge badge-warning">Todos</span> :
                    <div className="tags-container">{group.applicableInstallments.map((inst, i) => <span key={i} className="tag">{inst.label}</span>)}</div>}
                </td>
                <td>
                  {!group.applicableCreditScoreRanges?.length ? <span className="badge badge-warning">Todos</span> :
                    <div className="tags-container">{group.applicableCreditScoreRanges.map((r, i) => <span key={i} className="tag">{r.label}</span>)}</div>}
                </td>
                <td>
                  <span className={`badge ${group.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {group.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(group)} className="btn-edit">Editar</button>
                  <button onClick={() => handleDelete(group.id)} className="btn-delete">Eliminar</button>
                </td>
              </tr>
            ))}
            {filteredGroups.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: 'center', color: '#888' }}>No hay grupos configurados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductFeeGroups;
