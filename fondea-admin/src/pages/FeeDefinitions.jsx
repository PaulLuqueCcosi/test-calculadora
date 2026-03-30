import { useState, useEffect } from 'react';
import { feeDefinitionService } from '../services/feeService';
import './CrudPage.css';

const FEE_TYPES = ['INTEREST', 'SERVICE', 'INSURANCE', 'ADMINISTRATIVE'];

function FeeDefinitions() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    name: '', 
    type: '', 
    description: '' 
  });

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const response = await feeDefinitionService.getAll();
      setFees(response.data);
    } catch (error) {
      alert('Error al cargar definiciones de fee');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCode) {
        await feeDefinitionService.update(editingCode, formData);
      } else {
        await feeDefinitionService.create(formData);
      }
      loadFees();
      resetForm();
    } catch (error) {
      alert('Error al guardar definición de fee');
    }
  };

  const handleEdit = (fee) => {
    setEditingCode(fee.code);
    setFormData({ 
      code: fee.code, 
      name: fee.name, 
      type: fee.type, 
      description: fee.description || '' 
    });
    setShowForm(true);
  };

  const handleDelete = async (code) => {
    if (window.confirm('¿Eliminar esta definición de fee?')) {
      try {
        await feeDefinitionService.delete(code);
        loadFees();
      } catch (error) {
        alert('Error al eliminar definición de fee');
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', type: '', description: '' });
    setEditingCode(null);
    setShowForm(false);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Definiciones de Fee</h1>
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
              placeholder="TECH_FEE"
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
              {FEE_TYPES.map(type => (
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
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee.code}>
                <td><code>{fee.code}</code></td>
                <td>{fee.name}</td>
                <td><span className="badge badge-success">{fee.type}</span></td>
                <td>{fee.description}</td>
                <td>
                  <button onClick={() => handleEdit(fee)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(fee.code)} className="btn-delete">
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

export default FeeDefinitions;
