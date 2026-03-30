import { useState, useEffect } from 'react';
import { productFeeConfigService } from '../services/feeService';
import { feeDefinitionService } from '../services/feeService';
import { productService, productAmountService, productTermService } from '../services/productService';
import './CrudPage.css';

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
      applicableAmountIds: config.applicableAmounts?.map(a => a.id) || [],
      applicableTermIds: config.applicableTerms?.map(t => t.id) || []
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
    return amounts.filter(a => a.productId === formData.productId);
  };

  const getProductTerms = () => {
    return terms.filter(t => t.productId === formData.productId);
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
          <div className="form-group">
            <label>Montos Aplicables:</label>
            <select
              multiple
              value={formData.applicableAmountIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, applicableAmountIds: selected });
              }}
              style={{ minHeight: '100px' }}
            >
              {getProductAmounts().map(a => (
                <option key={a.id} value={a.id}>${a.amount}</option>
              ))}
            </select>
            <small>Mantén Ctrl/Cmd para seleccionar múltiples</small>
          </div>
          <div className="form-group">
            <label>Plazos Aplicables:</label>
            <select
              multiple
              value={formData.applicableTermIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, applicableTermIds: selected });
              }}
              style={{ minHeight: '100px' }}
            >
              {getProductTerms().map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <small>Mantén Ctrl/Cmd para seleccionar múltiples</small>
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
