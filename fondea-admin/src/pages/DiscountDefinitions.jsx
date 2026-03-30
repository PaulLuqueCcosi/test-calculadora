import { useState, useEffect } from 'react';
import { discountDefinitionService } from '../services/discountService';
import './CrudPage.css';

const DISCOUNT_TYPES = ['FIRST_LOAN', 'LOYALTY', 'PROMOTIONAL', 'SEASONAL'];
const CALCULATION_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];

function DiscountDefinitions() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    name: '', 
    type: '', 
    calculationType: '',
    description: '' 
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const response = await discountDefinitionService.getAll();
      setDiscounts(response.data);
    } catch (error) {
      alert('Error al cargar definiciones de descuento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCode) {
        await discountDefinitionService.update(editingCode, formData);
      } else {
        await discountDefinitionService.create(formData);
      }
      loadDiscounts();
      resetForm();
    } catch (error) {
      alert('Error al guardar definición de descuento');
    }
  };

  const handleEdit = (discount) => {
    setEditingCode(discount.code);
    setFormData({ 
      code: discount.code, 
      name: discount.name, 
      type: discount.type,
      calculationType: discount.calculationType,
      description: discount.description || '' 
    });
    setShowForm(true);
  };

  const handleDelete = async (code) => {
    if (window.confirm('¿Eliminar esta definición de descuento?')) {
      try {
        await discountDefinitionService.delete(code);
        loadDiscounts();
      } catch (error) {
        alert('Error al eliminar definición de descuento');
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', type: '', calculationType: '', description: '' });
    setEditingCode(null);
    setShowForm(false);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Definiciones de Descuento</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : 'Nueva Definición'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Código:</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              maxLength={50}
              pattern="[A-Z_]+"
              disabled={!!editingCode}
              placeholder="FIRST_LOAN_DISCOUNT"
            />
            <small>Solo mayúsculas y guiones bajos</small>
          </div>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>Tipo:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="">Seleccionar tipo</option>
              {DISCOUNT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
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
            <label>Descripción:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={500}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingCode ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Cálculo</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => (
              <tr key={discount.code}>
                <td><code>{discount.code}</code></td>
                <td>{discount.name}</td>
                <td><span className="badge badge-success">{discount.type}</span></td>
                <td>{discount.calculationType}</td>
                <td>{discount.description}</td>
                <td>
                  <button onClick={() => handleEdit(discount)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(discount.code)} className="btn-delete">
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

export default DiscountDefinitions;
