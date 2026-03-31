import { useState, useEffect } from 'react';
import { productDiscountConfigService, discountDefinitionService } from '../services/discountService';
import { productService, productAmountService, productTermService, productInstallmentOptionService, creditScoreRangeService } from '../services/productService';
import './CrudPage.css';
import './ConfigPage.css';

const CALCULATION_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];

function ProductDiscountConfigs() {
  const [configs, setConfigs] = useState([]);
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [terms, setTerms] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [scoreRanges, setScoreRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    productId: '',
    discountDefinitionCode: '',
    calculationType: '',
    value: '',
    isFirstLoanOnly: false,
    isActive: true,
    applicableAmountIds: [],
    applicableTermIds: [],
    applicableInstallmentIds: [],
    applicableCreditScoreRangeIds: []
  });
  const [filter, setFilter] = useState({ productId: '', discountCode: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configsRes, productsRes, discountsRes, amountsRes, termsRes, installmentsRes, scoresRes] = await Promise.all([
        productDiscountConfigService.getAll(),
        productService.getAll(),
        discountDefinitionService.getAll(),
        productAmountService.getAll(),
        productTermService.getAll(),
        productInstallmentOptionService.getAll(),
        creditScoreRangeService.getAll()
      ]);
      setConfigs(configsRes.data);
      setProducts(productsRes.data);
      setDiscounts(discountsRes.data);
      setAmounts(amountsRes.data);
      setTerms(termsRes.data);
      setInstallments(installmentsRes.data);
      setScoreRanges(scoresRes.data);
    } catch (error) {
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.productId) {
      if (getProductAmounts().length > 0 && formData.applicableAmountIds.length === 0)
        return alert('Debes seleccionar al menos un monto aplicable.');
      if (getProductTerms().length > 0 && formData.applicableTermIds.length === 0)
        return alert('Debes seleccionar al menos un plazo aplicable.');
      if (getProductInstallments().length > 0 && formData.applicableInstallmentIds.length === 0)
        return alert('Debes seleccionar al menos una cuota aplicable.');
      if (getProductScoreRanges().length > 0 && formData.applicableCreditScoreRangeIds.length === 0)
        return alert('Debes seleccionar al menos un rango de score aplicable.');
    }
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value)
      };
      if (editingId) {
        await productDiscountConfigService.update(editingId, payload);
      } else {
        await productDiscountConfigService.create(payload);
      }
      loadData();
      resetForm();
    } catch (error) {
      alert('Error al guardar configuración');
    }
  };

  const handleEdit = (config) => {
    setEditingId(config.id);
    setFormData({ 
      productId: config.productId,
      discountDefinitionCode: config.discountDefinitionCode,
      calculationType: config.calculationType,
      value: config.value,
      isFirstLoanOnly: config.isFirstLoanOnly,
      isActive: config.isActive,
      applicableAmountIds: config.applicableAmounts?.map(a => {
        const amount = amounts.find(am => am.amount === a.value && am.productId === config.productId);
        return amount?.id;
      }).filter(Boolean) || [],
      applicableTermIds: config.applicableTerms?.map(t => {
        const term = terms.find(tm => tm.termDays === t.value && tm.productId === config.productId);
        return term?.id;
      }).filter(Boolean) || [],
      applicableInstallmentIds: config.applicableInstallments?.map(i => {
        const inst = installments.find(im => im.installmentCount === i.value && im.productId === config.productId);
        return inst?.id;
      }).filter(Boolean) || [],
      applicableCreditScoreRangeIds: scoreRanges
        .filter(r => r.productId === config.productId && config.applicableInstallments?.some(i => i.availableForCreditScores?.some(s => s.id === r.id)))
        .map(r => r.id)
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta configuración?')) {
      try {
        await productDiscountConfigService.delete(id);
        loadData();
      } catch (error) {
        alert('Error al eliminar configuración');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      productId: '',
      discountDefinitionCode: '',
      calculationType: '',
      value: '',
      isFirstLoanOnly: false,
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
    (!filter.discountCode || config.discountDefinitionCode === filter.discountCode)
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
        : [...prev.applicableAmountIds, amountId]
    }));
  };

  const toggleTerm = (termId) => {
    setFormData(prev => ({
      ...prev,
      applicableTermIds: prev.applicableTermIds.includes(termId)
        ? prev.applicableTermIds.filter(id => id !== termId)
        : [...prev.applicableTermIds, termId]
    }));
  };

  const selectAllAmounts = () => {
    const allAmountIds = getProductAmounts().map(a => a.id);
    setFormData(prev => ({ ...prev, applicableAmountIds: allAmountIds }));
  };

  const clearAllAmounts = () => {
    setFormData(prev => ({ ...prev, applicableAmountIds: [] }));
  };

  const selectAllTerms = () => {
    const allTermIds = getProductTerms().map(t => t.id);
    setFormData(prev => ({ ...prev, applicableTermIds: allTermIds }));
  };

  const clearAllTerms = () => {
    setFormData(prev => ({ ...prev, applicableTermIds: [] }));
  };

  const getProductInstallments = () => {
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
    setFormData(prev => ({ ...prev, applicableInstallmentIds: getProductInstallments().map(i => i.id) }));
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
        : [...prev.applicableCreditScoreRangeIds, rangeId]
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
        <h1>Configuración de Descuentos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : 'Nueva Configuración'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Producto:</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value, applicableAmountIds: [], applicableTermIds: [], applicableInstallmentIds: [], applicableCreditScoreRangeIds: [] })}
                required
              >
                <option value="">Seleccionar producto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Descuento:</label>
              <select
                value={formData.discountDefinitionCode}
                onChange={(e) => setFormData({ ...formData, discountDefinitionCode: e.target.value })}
                required
              >
                <option value="">Seleccionar descuento</option>
                {discounts.map(d => (
                  <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
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

          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isFirstLoanOnly}
                  onChange={(e) => setFormData({ ...formData, isFirstLoanOnly: e.target.checked })}
                />
                {' '}Solo Primer Préstamo
              </label>
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
                {getProductInstallments().length === 0 ? (
                  <div className="empty-message">No hay cuotas activas para este producto</div>
                ) : (
                  <>
                    <div className="checkbox-grid">
                      {getProductInstallments().map(inst => (
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
            <label>Filtrar por Descuento:</label>
            <select
              value={filter.discountCode}
              onChange={(e) => setFilter({ ...filter, discountCode: e.target.value })}
            >
              <option value="">Todos</option>
              {discounts.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
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
              <th>Descuento</th>
              <th>Tipo Cálculo</th>
              <th>Valor</th>
              <th>Montos Aplicables</th>
              <th>Plazos Aplicables</th>
              <th>Cuotas Aplicables</th>
              <th>Score Ranges</th>
              <th>Primer Préstamo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredConfigs.map((config) => (
              <tr key={config.id}>
                <td>{config.productName}</td>
                <td>{config.discountDefinitionName}</td>
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
                  {config.isFirstLoanOnly ? (
                    <span className="badge badge-success">Sí</span>
                  ) : (
                    <span className="badge badge-info">No</span>
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

export default ProductDiscountConfigs;
