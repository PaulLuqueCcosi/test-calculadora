import { useState, useEffect } from 'react';
import { productFeeConfigService } from '../services/feeService';
import { feeDefinitionService } from '../services/feeService';
import { productService, productAmountService, productTermService, productInstallmentOptionService, creditScoreRangeService } from '../services/productService';
import './CrudPage.css';
import './ConfigPage.css';

const CALCULATION_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];

function ProductFeeConfigs() {
  const [configs, setConfigs] = useState([]);
  const [products, setProducts] = useState([]);
  const [fees, setFees] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [terms, setTerms] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [scoreRanges, setScoreRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    productId: '',
    feeDefinitionCode: '',
    calculationType: '',
    value: '',
    isActive: true,
    applicableAmountIds: [],
    applicableTermIds: [],
    applicableInstallmentIds: [],
    applicableCreditScoreRangeIds: []
  });
  const [filter, setFilter] = useState({ productId: '', feeCode: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configsRes, productsRes, feesRes, scoresRes] = await Promise.all([
        productFeeConfigService.getAll(),
        productService.getAll(),
        feeDefinitionService.getAll(),
        creditScoreRangeService.getAll()
      ]);
      setConfigs(configsRes.data);
      setProducts(productsRes.data);
      setFees(feesRes.data);
      setScoreRanges(scoresRes.data);
    } catch (error) {
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Load product-specific data when productId changes in form
  const loadProductData = async (productId) => {
    if (!productId) {
      setAmounts([]); setTerms([]); setInstallments([]);
      return { amounts: [], terms: [], installments: [], scoreRanges: [] };
    }
    try {
      const [amountsRes, termsRes, installmentsRes, scoresRes] = await Promise.all([
        productAmountService.getByProduct(productId),
        productTermService.getByProduct(productId),
        productInstallmentOptionService.getByProduct(productId),
        creditScoreRangeService.getByProduct(productId),
      ]);
      setAmounts(amountsRes.data);
      setTerms(termsRes.data);
      setInstallments(installmentsRes.data);
      setScoreRanges(scoresRes.data);
      return { amounts: amountsRes.data, terms: termsRes.data, installments: installmentsRes.data, scoreRanges: scoresRes.data };
    } catch {
      alert('Error al cargar datos del producto');
      return { amounts: [], terms: [], installments: [], scoreRanges: [] };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.productId) {
      if (getProductAmounts().length > 0 && formData.applicableAmountIds.length === 0)
        return alert('Debes seleccionar al menos un monto aplicable.');
      if (getProductTerms().length > 0 && formData.applicableTermIds.length === 0)
        return alert('Debes seleccionar al menos un plazo aplicable.');
      if (getAvailableInstallments().length > 0 && formData.applicableInstallmentIds.length === 0)
        return alert('Debes seleccionar al menos una cuota aplicable.');
    }
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value)
      };
      if (editingId) {
        await productFeeConfigService.update(editingId, payload);
      } else {
        await productFeeConfigService.create(payload);
      }
      loadData();
      resetForm();
    } catch (error) {
      alert('Error al guardar configuración');
    }
  };

  const handleEdit = async (config) => {
    setEditingId(config.id);
    const { amounts: a, terms: t, installments: inst, scoreRanges: sr } = await loadProductData(config.productId);
    setFormData({ 
      productId: config.productId,
      feeDefinitionCode: config.feeDefinitionCode,
      calculationType: config.calculationType,
      value: config.value,
      isActive: config.isActive,
      applicableAmountIds: config.applicableAmounts?.map(ao => a.find(am => am.amount === ao.value)?.id).filter(Boolean) || [],
      applicableTermIds: config.applicableTerms?.map(to => t.find(tm => tm.termDays === to.value)?.id).filter(Boolean) || [],
      applicableInstallmentIds: config.applicableInstallments?.map(io => inst.find(im => im.installmentCount === io.value)?.id).filter(Boolean) || [],
      applicableCreditScoreRangeIds: config.applicableCreditScoreRanges?.map(ro => sr.find(r => r.id === ro.id)?.id).filter(Boolean) || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta configuración?')) {
      try {
        await productFeeConfigService.delete(id);
        loadData();
      } catch (error) {
        alert('Error al eliminar configuración');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      productId: '',
      feeDefinitionCode: '',
      calculationType: '',
      value: '',
      isActive: true,
      applicableAmountIds: [],
      applicableTermIds: [],
      applicableInstallmentIds: [],
      applicableCreditScoreRangeIds: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredConfigs = configs.filter(config => 
    (!filter.productId || config.productId === filter.productId) &&
    (!filter.feeCode || config.feeDefinitionCode === filter.feeCode)
  );

  const getProductAmounts = () => {
    return amounts.filter(a => a.productId === formData.productId && a.isActive);
  };

  const getProductTerms = () => {
    return terms.filter(t => t.productId === formData.productId && t.isActive);
  };

  const toggleAmount = (amountId) => {
    setFormData(prev => ({
      ...prev,
      applicableAmountIds: prev.applicableAmountIds.includes(amountId)
        ? prev.applicableAmountIds.filter(id => id !== amountId)
        : [...prev.applicableAmountIds, amountId],
    }));
  };

  const toggleTerm = (termId) => {
    setFormData(prev => ({
      ...prev,
      applicableTermIds: prev.applicableTermIds.includes(termId)
        ? prev.applicableTermIds.filter(id => id !== termId)
        : [...prev.applicableTermIds, termId],
    }));
  };

  const selectAllAmounts = () => {
    setFormData(prev => ({ ...prev, applicableAmountIds: getProductAmounts().map(a => a.id) }));
  };

  const clearAllAmounts = () => {
    setFormData(prev => ({ ...prev, applicableAmountIds: [] }));
  };

  const selectAllTerms = () => {
    setFormData(prev => ({ ...prev, applicableTermIds: getProductTerms().map(t => t.id) }));
  };

  const clearAllTerms = () => {
    setFormData(prev => ({ ...prev, applicableTermIds: [] }));
  };

  const getAvailableInstallments = () => {
    return installments.filter(i => i.productId === formData.productId && i.isActive);
  };

  const toggleInstallment = (instId) => {
    setFormData(prev => ({
      ...prev,
      applicableInstallmentIds: prev.applicableInstallmentIds.includes(instId)
        ? prev.applicableInstallmentIds.filter(id => id !== instId)
        : [...prev.applicableInstallmentIds, instId]
    }));
  };

  const selectAllInstallments = () => {
    setFormData(prev => ({ ...prev, applicableInstallmentIds: getAvailableInstallments().map(i => i.id) }));
  };

  const clearAllInstallments = () => {
    setFormData(prev => ({ ...prev, applicableInstallmentIds: [] }));
  };

  const getProductScoreRanges = () => {
    return scoreRanges.filter(r => r.productId === formData.productId && r.isActive);
  };

  const toggleScoreRange = (rangeId) => {
    setFormData(prev => ({
      ...prev,
      applicableCreditScoreRangeIds: prev.applicableCreditScoreRangeIds.includes(rangeId)
        ? prev.applicableCreditScoreRangeIds.filter(id => id !== rangeId)
        : [...prev.applicableCreditScoreRangeIds, rangeId],
    }));
  };

  const selectAllScoreRanges = () => {
    setFormData(prev => ({ ...prev, applicableCreditScoreRangeIds: getProductScoreRanges().map(r => r.id) }));
  };

  const clearAllScoreRanges = () => {
    setFormData(prev => ({ ...prev, applicableCreditScoreRangeIds: [] }));
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Fee Configs (Detalle)</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : 'Nueva Configuración Manual'}
        </button>
      </div>

      <div className="info-banner">
        💡 Estos configs son generados automáticamente por los <strong>Grupos de Comisiones</strong>. Solo crea configs manuales si necesitas un fee individual sin grupo.
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Producto:</label>
              <select
                value={formData.productId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setFormData({ ...formData, productId: pid, applicableAmountIds: [], applicableTermIds: [], applicableInstallmentIds: [], applicableCreditScoreRangeIds: [] });
                  loadProductData(pid);
                }}
                required
              >
                <option value="">Seleccionar producto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fee:</label>
              <select
                value={formData.feeDefinitionCode}
                onChange={(e) => setFormData({ ...formData, feeDefinitionCode: e.target.value })}
                required
              >
                <option value="">Seleccionar fee</option>
                {fees.map(f => (
                  <option key={f.code} value={f.code}>{f.name} ({f.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Cálculo:</label>
              <select
                value={formData.calculationType}
                onChange={(e) => setFormData({ ...formData, calculationType: e.target.value })}
                required
              >
                <option value="">Seleccionar tipo</option>
                {CALCULATION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Valor:</label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
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

          {formData.productId && (
            <>
              <div className="selection-section">
                <div className="section-header">
                  <label>Montos Aplicables:</label>
                  <div className="selection-actions">
                    <button type="button" onClick={selectAllAmounts} className="btn-link">
                      Seleccionar todos
                    </button>
                    <button type="button" onClick={clearAllAmounts} className="btn-link">
                      Limpiar
                    </button>
                  </div>
                </div>
                {getProductAmounts().length === 0 ? (
                  <div className="empty-message">No hay montos activos para este producto</div>
                ) : (
                  <>
                    <div className="checkbox-grid">
                      {getProductAmounts().map(amount => (
                        <label key={amount.id} className="checkbox-card">
                          <input
                            type="checkbox"
                            checked={formData.applicableAmountIds.includes(amount.id)}
                            onChange={() => toggleAmount(amount.id)}
                          />
                          <span className="checkbox-label">${amount.amount.toFixed(2)}</span>
                        </label>
                      ))}
                    </div>
                    {formData.applicableAmountIds.length === 0 && (
                      <div className="error-message">
                        ⚠️ Debes seleccionar al menos un monto
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="selection-section">
                <div className="section-header">
                  <label>Plazos Aplicables:</label>
                  <div className="selection-actions">
                    <button type="button" onClick={selectAllTerms} className="btn-link">
                      Seleccionar todos
                    </button>
                    <button type="button" onClick={clearAllTerms} className="btn-link">
                      Limpiar
                    </button>
                  </div>
                </div>
                {getProductTerms().length === 0 ? (
                  <div className="empty-message">No hay plazos activos para este producto</div>
                ) : (
                  <>
                    <div className="checkbox-grid">
                      {getProductTerms().map(term => (
                        <label key={term.id} className="checkbox-card">
                          <input
                            type="checkbox"
                            checked={formData.applicableTermIds.includes(term.id)}
                            onChange={() => toggleTerm(term.id)}
                          />
                          <span className="checkbox-label">{term.label}</span>
                        </label>
                      ))}
                    </div>
                    {formData.applicableTermIds.length === 0 && (
                      <div className="error-message">
                        ⚠️ Debes seleccionar al menos un plazo
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="selection-section">
                <div className="section-header">
                  <label>Cuotas Aplicables:</label>
                  <div className="selection-actions">
                    <button type="button" onClick={selectAllInstallments} className="btn-link">
                      Seleccionar todas
                    </button>
                    <button type="button" onClick={clearAllInstallments} className="btn-link">
                      Limpiar
                    </button>
                  </div>
                </div>
                {getAvailableInstallments().length === 0 ? (
                  <div className="empty-message">No hay cuotas compatibles con la combinación seleccionada</div>
                ) : (
                  <>
                    <div className="checkbox-grid">
                      {getAvailableInstallments().map(inst => (
                        <label key={inst.id} className="checkbox-card">
                          <input
                            type="checkbox"
                            checked={formData.applicableInstallmentIds.includes(inst.id)}
                            onChange={() => toggleInstallment(inst.id)}
                          />
                          <span className="checkbox-label">{inst.label}</span>
                        </label>
                      ))}
                    </div>
                    {formData.applicableInstallmentIds.length === 0 && (
                      <div className="error-message">
                        ⚠️ Debes seleccionar al menos una cuota
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="selection-section">
                <div className="section-header">
                  <label>Rangos de Score Crediticio Aplicables:</label>
                  <div className="selection-actions">
                    <button type="button" onClick={selectAllScoreRanges} className="btn-link">Seleccionar todos</button>
                    <button type="button" onClick={clearAllScoreRanges} className="btn-link">Limpiar</button>
                  </div>
                </div>
                {getProductScoreRanges().length === 0 ? (
                  <div className="empty-message">No hay rangos de score activos para este producto</div>
                ) : (
                  <>
                    <div className="checkbox-grid">
                      {getProductScoreRanges().map(range => (
                        <label key={range.id} className="checkbox-card">
                          <input
                            type="checkbox"
                            checked={formData.applicableCreditScoreRangeIds.includes(range.id)}
                            onChange={() => toggleScoreRange(range.id)}
                          />
                          <span className="checkbox-label">{range.label} ({range.minScore}-{range.maxScore})</span>
                        </label>
                      ))}
                    </div>
                    {formData.applicableCreditScoreRangeIds.length === 0 && (
                      <div className="error-message">⚠️ Debes seleccionar al menos un rango de score</div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

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
          <div className="form-group">
            <label>Filtrar por Fee:</label>
            <select
              value={filter.feeCode}
              onChange={(e) => setFilter({ ...filter, feeCode: e.target.value })}
            >
              <option value="">Todos</option>
              {fees.map(f => (
                <option key={f.code} value={f.code}>{f.name}</option>
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
              <th>Fee</th>
              <th>Tipo Cálculo</th>
              <th>Valor</th>
              <th>Montos Aplicables</th>
              <th>Plazos Aplicables</th>
              <th>Cuotas Aplicables</th>
              <th>Score Ranges</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredConfigs.map((config) => (
              <tr key={config.id}>
                <td>{config.productName}</td>
                <td>{config.feeDefinitionName}</td>
                <td>{config.calculationType}</td>
                <td>{config.value}</td>
                <td>
                  {!config.applicableAmounts || config.applicableAmounts.length === 0 ? (
                    <span className="badge badge-warning">Sin configurar</span>
                  ) : (
                    <div className="tags-container">
                      {config.applicableAmounts.map((a, idx) => (
                        <span key={idx} className="tag">${a.value}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  {!config.applicableTerms || config.applicableTerms.length === 0 ? (
                    <span className="badge badge-warning">Sin configurar</span>
                  ) : (
                    <div className="tags-container">
                      {config.applicableTerms.map((t, idx) => (
                        <span key={idx} className="tag">{t.label}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  {!config.applicableInstallments || config.applicableInstallments.length === 0 ? (
                    <span className="badge badge-warning">Sin configurar</span>
                  ) : (
                    <div className="tags-container">
                      {config.applicableInstallments.map((i, idx) => (
                        <span key={idx} className="tag">{i.label}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  {!config.applicableCreditScoreRanges || config.applicableCreditScoreRanges?.length === 0 ? (
                    <span className="badge badge-warning">Sin configurar</span>
                  ) : (
                    <div className="tags-container">
                      {config.applicableCreditScoreRanges.map((r, idx) => (
                        <span key={idx} className="tag">{r.label}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`badge ${config.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {config.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(config)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(config.id)} className="btn-delete">
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

export default ProductFeeConfigs;
