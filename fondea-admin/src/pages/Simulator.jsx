import { useState, useEffect } from 'react';
import { simulatorService } from '../services/simulatorService';
import './Simulator.css';

function Simulator() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productOptions, setProductOptions] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    amount: '',
    termDays: '',
    isFirstLoan: false
  });
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await simulatorService.getProducts();
      setProducts(response.data);
    } catch (error) {
      alert('Error al cargar productos');
    }
  };

  const handleProductChange = async (productId) => {
    setFormData({ ...formData, productId, amount: '', termDays: '' });
    setSimulation(null);
    
    if (productId) {
      try {
        const response = await simulatorService.getProductOptions(productId);
        setProductOptions(response.data);
        setSelectedProduct(response.data.product);
      } catch (error) {
        alert('Error al cargar opciones del producto');
      }
    } else {
      setProductOptions(null);
      setSelectedProduct(null);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        productId: formData.productId,
        amount: parseFloat(formData.amount),
        termDays: parseInt(formData.termDays),
        isFirstLoan: formData.isFirstLoan
      };
      const response = await simulatorService.simulate(payload);
      setSimulation(response.data);
    } catch (error) {
      alert('Error al simular préstamo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simulator-page">
      <h1>Simulador de Préstamos</h1>

      <div className="simulator-container">
        <form onSubmit={handleSimulate} className="simulator-form">
          <div className="form-group">
            <label>Producto:</label>
            <select
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              required
            >
              <option value="">Seleccionar producto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {productOptions && (
            <>
              <div className="form-group">
                <label>Monto:</label>
                <select
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                >
                  <option value="">Seleccionar monto</option>
                  {productOptions.amounts.map((a, idx) => (
                    <option key={idx} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Plazo:</label>
                <select
                  value={formData.termDays}
                  onChange={(e) => setFormData({ ...formData, termDays: e.target.value })}
                  required
                >
                  <option value="">Seleccionar plazo</option>
                  {productOptions.terms.map((t, idx) => (
                    <option key={idx} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isFirstLoan}
                onChange={(e) => setFormData({ ...formData, isFirstLoan: e.target.checked })}
              />
              {' '}¿Es primer préstamo?
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Simulando...' : 'Simular'}
          </button>
        </form>

        {simulation && (
          <div className="simulation-results">
            <h2>Resultados de la Simulación</h2>
            
            <div className="result-card">
              <h3>Información General</h3>
              <div className="result-row">
                <span>Producto:</span>
                <strong>{simulation.product.name}</strong>
              </div>
              <div className="result-row">
                <span>Monto Principal:</span>
                <strong>${simulation.principal.toFixed(2)}</strong>
              </div>
              <div className="result-row">
                <span>Plazo:</span>
                <strong>{simulation.termDays} días</strong>
              </div>
              <div className="result-row">
                <span>Primer Préstamo:</span>
                <strong>{simulation.isFirstLoan ? 'Sí' : 'No'}</strong>
              </div>
            </div>

            {simulation.fees && Object.keys(simulation.fees).length > 0 && (
              <div className="result-card">
                <h3>Comisiones (Fees)</h3>
                {Object.entries(simulation.fees).map(([key, fee]) => (
                  <div key={key} className="fee-item">
                    <div className="fee-header">
                      <strong>{fee.name}</strong>
                      <span className="badge badge-success">{fee.type}</span>
                    </div>
                    <div className="result-row">
                      <span>Monto Original:</span>
                      <span>${fee.originalAmount.toFixed(2)}</span>
                    </div>
                    <div className="result-row">
                      <span>Descuento:</span>
                      <span className="discount-amount">-${fee.discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="result-row">
                      <span>Monto Final:</span>
                      <strong>${fee.finalAmount.toFixed(2)}</strong>
                    </div>
                    {fee.config && (
                      <div className="result-row">
                        <span>Configuración:</span>
                        <span>{fee.config.calculationType} - {fee.config.value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {simulation.discounts && Object.keys(simulation.discounts).length > 0 && (
              <div className="result-card">
                <h3>Descuentos Aplicados</h3>
                {Object.entries(simulation.discounts).map(([key, discount]) => (
                  <div key={key} className="discount-item">
                    <div className="result-row">
                      <span>{discount.name}:</span>
                      <strong className="discount-amount">-${discount.totalDiscountAmount.toFixed(2)}</strong>
                    </div>
                    <div className="result-row">
                      <span>Tipo:</span>
                      <span>{discount.type}</span>
                    </div>
                    {discount.isFirstLoanOnly && (
                      <div className="result-row">
                        <span className="badge badge-success">Solo Primer Préstamo</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="result-card summary-card">
              <h3>Resumen</h3>
              <div className="result-row">
                <span>Total Fees Original:</span>
                <span>${simulation.summary.totalFeesOriginal.toFixed(2)}</span>
              </div>
              <div className="result-row">
                <span>Descuentos Porcentuales:</span>
                <span className="discount-amount">-${simulation.summary.totalPercentageDiscounts.toFixed(2)}</span>
              </div>
              <div className="result-row">
                <span>Descuentos Fijos:</span>
                <span className="discount-amount">-${simulation.summary.totalFixedDiscounts.toFixed(2)}</span>
              </div>
              <div className="result-row">
                <span>Total Descuentos:</span>
                <strong className="discount-amount">-${simulation.summary.totalDiscounts.toFixed(2)}</strong>
              </div>
              <div className="result-row">
                <span>Total Fees Resultado:</span>
                <span>${simulation.summary.totalFeesResult.toFixed(2)}</span>
              </div>
              <div className="result-row">
                <span>IGV:</span>
                <span>${simulation.summary.totalIgvFromTotalFeesResult.toFixed(2)}</span>
              </div>
              <div className="result-row total-row">
                <span>TOTAL A PAGAR:</span>
                <strong>${simulation.summary.totalToPay.toFixed(2)}</strong>
              </div>
            </div>

            {simulation.schedule && simulation.schedule.length > 0 && (
              <div className="result-card">
                <h3>Cronograma de Pagos</h3>
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Cuota</th>
                      <th>Fecha de Vencimiento</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulation.schedule.map((installment) => (
                      <tr key={installment.installmentNo}>
                        <td>{installment.installmentNo}</td>
                        <td>{installment.dueDate}</td>
                        <td>${installment.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Simulator;
