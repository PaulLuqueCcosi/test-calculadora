import { useState, useEffect } from 'react';
import { productDiscountConfigService, discountDefinitionService } from '../services/discountService';
import { productService, productAmountService, productTermService } from '../services/productService';
import './CrudPage.css';

const CALCULATION_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];

function ProductDiscountConfigs() {
  const [configs, setConfigs] = useState([]);
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [terms, setTerms] = useState([]);
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
    applicableTermIds: []
  });
  const [filter, setFilter] = useState({ productId: '', discountCode: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configsRes, productsRes, discountsRes, amountsRes, termsRes] = await Promise.all([
        productDiscountConfigService.getAll(),
        productService.getAll(),
        discountDefinitionService.getAll(),
        productAmountService.getAll(),
        productTermService.getAll()
      ]);
      setConfigs(configsRes.data);
      setProducts(productsRes.data);
      setDiscounts(discountsRes.data);
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
      applicableAmountIds: config.applicableAmounts?.map(a => a.id) || [],
      applicableTermIds: config.applicableTerms?.map(t => t.id) || []
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
      applicableTermIds: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredConfigs = configs.filter(config => 
    (!filter.productId || config.productId === filter.productId) &&
    (!filter.discountCode || config.discountDefinitionCode === filter.discountCode)
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
        <h1>Configuración de Descuentos</h1>
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
                <td>{config.isFirstLoanOnly ? 'Sí' : 'No'}</td>
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
