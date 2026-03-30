import { useState, useEffect } from 'react';
import { productFeeConfigService } from '../services/feeService';
import { feeDefinitionService } from '../services/feeService';
import { productService, productAmountService, productTermService } from '../services/productService';
import './CrudPage.css';
import './ConfigPage.css';

const CALCULATION_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];

function ProductFeeConfigs() {
  const [configs, setConfigs] = useState([]);
  const [products, setProducts] = useState([]);
  const [fees, setFees] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [terms, setTerms] = useState([]);
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
    applicableTermIds: []
  });
  const [filter, setFilter] = useState({ productId: '', feeCode: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configsRes, productsRes, feesRes, amountsRes, termsRes] = await Promise.all([
        productFeeConfigService.getAll(),
        productService.getAll(),
        feeDefinitionService.getAll(),
        productAmountService.getAll(),
        productTermService.getAll()
      ]);
      setConfigs(configsRes.data);
      setProducts(productsRes.data);
      setFees(feesRes.data);
      setAmounts(amountsRes.data);
      setTerms(termsRes.data);
    } catch (error) {
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

  const handleEdit = (config) => {
    setEditingId(config.id);
    setFormData({ 
      productId: config.productId,
      feeDefinitionCode: config.feeDefinitionCode,
      calculationType: config.calculationType,
      value: config.value,
      isActive: config.isActive,
      applicableAmountIds: config.applicableAmounts?.map(a => {
        const amount = amounts.find(am => am.amount === a.value && am.productId === config.productId);
        return amount?.id;
      }).filter(Boolean) || [],
      applicableTermIds: config.applicableTerms?.map(t => {
        const term = terms.find(tm => tm.termDays === t.value && tm.productId === config.productId);
        return term?.id;
      }).filter(Boolean) || []
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
      applicableTermIds: []
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

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Configuración de Fees</h1>
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
                onChange={(e) => setFormData({ ...formData, productId: e.target.value, applicableAmountIds: [], applicableTermIds: [] })}
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
                      <div className="info-message">
                        ℹ️ Si no seleccionas ningún monto, el fee aplicará para todos los montos
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
                      <div className="info-message">
                        ℹ️ Si no seleccionas ningún plazo, el fee aplicará para todos los plazos
                      </div>
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
                    <span className="badge badge-info">Todos</span>
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
                    <span className="badge badge-info">Todos</span>
                  ) : (
                    <div className="tags-container">
                      {config.applicableTerms.map((t, idx) => (
                        <span key={idx} className="tag">{t.label}</span>
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
