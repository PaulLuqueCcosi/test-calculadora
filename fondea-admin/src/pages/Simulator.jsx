import { useState, useEffect } from 'react';
import { simulatorService } from '../services/simulatorService';
import './Simulator.css';

function Simulator() {
  const [products, setProducts] = useState([]);
  const [productOptions, setProductOptions] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    amount: '',
    termDays: '',
    installmentCount: '',
    creditScore: '',
    isFirstLoan: false,
  });
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await simulatorService.getProducts();
      setProducts(res.data);
    } catch {
      alert('Error al cargar productos');
    }
  };

  const handleProductChange = async (productId) => {
    setFormData({ productId, amount: '', termDays: '', installmentCount: '', creditScore: '', isFirstLoan: false });
    setSimulation(null);
    setProductOptions(null);
    if (!productId) return;
    setLoadingOptions(true);
    try {
      const res = await simulatorService.getProductOptions(productId);
      setProductOptions(res.data);
    } catch {
      alert('Error al cargar opciones del producto');
    } finally {
      setLoadingOptions(false);
    }
  };

  // Filter installments based on selected amount, termDays and creditScore
  const getAvailableInstallments = () => {
    if (!productOptions?.installments) return [];
    const amount = parseFloat(formData.amount);
    const term = parseInt(formData.termDays);
    const score = parseInt(formData.creditScore);

    return productOptions.installments.filter(inst => {
      const amountOk = !inst.availableForAmounts?.length || inst.availableForAmounts.includes(amount);
      const termOk = !inst.availableForTerms?.length || inst.availableForTerms.includes(term);
      const scoreOk = !inst.availableForCreditScores?.length ||
        inst.availableForCreditScores.some(r => score >= r.minScore && score <= r.maxScore);
      return amountOk && termOk && scoreOk;
    });
  };

  // Find which score range the entered score falls into
  const getScoreRange = () => {
    if (!productOptions?.creditScoreRanges || !formData.creditScore) return null;
    const score = parseInt(formData.creditScore);
    return productOptions.creditScoreRanges.find(r => score >= r.minScore && score <= r.maxScore);
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSimulation(null);
    try {
      const payload = {
        productId: formData.productId,
        amount: parseFloat(formData.amount),
        termDays: parseInt(formData.termDays),
        installmentCount: parseInt(formData.installmentCount),
        creditScore: parseInt(formData.creditScore),
        isFirstLoan: formData.isFirstLoan,
      };
      const res = await simulatorService.simulate(payload);
      setSimulation(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al simular préstamo';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // reset installment when amount/term/score changes
      if (['amount', 'termDays', 'creditScore'].includes(field)) {
        next.installmentCount = '';
      }
      return next;
    });
    setSimulation(null);
  };

  const scoreRange = getScoreRange();
  const availableInstallments = getAvailableInstallments();

  return (
    <div className="simulator-page">
      <h1>Simulador de Préstamos</h1>

      <div className="simulator-container">
        <form onSubmit={handleSimulate} className="simulator-form">

          <div className="form-group">
            <label>Producto:</label>
            <select value={formData.productId} onChange={(e) => handleProductChange(e.target.value)} required>
              <option value="">Seleccionar producto</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {loadingOptions && <div className="loading-hint">Cargando opciones...</div>}

          {productOptions && (
            <>
              <div className="form-group">
                <label>Monto:</label>
                <select value={formData.amount} onChange={(e) => set('amount', e.target.value)} required>
                  <option value="">Seleccionar monto</option>
                  {productOptions.amounts.map((a, i) => (
                    <option key={i} value={a.value}>{a.label || `$${a.value}`}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Plazo:</label>
                <select value={formData.termDays} onChange={(e) => set('termDays', e.target.value)} required>
                  <option value="">Seleccionar plazo</option>
                  {productOptions.terms.map((t, i) => (
                    <option key={i} value={t.value}>{t.label || `${t.value} días`}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Score Crediticio (0–999):</label>
                <div className="score-input-row">
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={formData.creditScore}
                    onChange={(e) => set('creditScore', e.target.value)}
                    placeholder="Ej: 750"
                    required
                  />
                  {scoreRange && (
                    <span
                      className="score-range-pill"
                      style={{
                        background: (scoreRange.color || '#757575') + '22',
                        color: scoreRange.color || '#757575',
                        borderColor: scoreRange.color || '#757575'
                      }}
                    >
                      {scoreRange.label}
                    </span>
                  )}
                  {formData.creditScore && !scoreRange && (
                    <span className="score-no-range">Sin rango configurado</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Cuotas:</label>
                {!formData.amount || !formData.termDays || !formData.creditScore ? (
                  <div className="info-hint">Selecciona monto, plazo y score para ver las cuotas disponibles</div>
                ) : availableInstallments.length === 0 ? (
                  <div className="error-hint">No hay cuotas disponibles para esta combinación</div>
                ) : (
                  <select value={formData.installmentCount} onChange={(e) => set('installmentCount', e.target.value)} required>
                    <option value="">Seleccionar cuotas</option>
                    {availableInstallments.map((inst, i) => (
                      <option key={i} value={inst.value}>{inst.label || `${inst.value} cuotas`}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isFirstLoan}
                    onChange={(e) => set('isFirstLoan', e.target.checked)}
                  />
                  {' '}¿Es primer préstamo?
                </label>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary btn-simulate" disabled={loading || !formData.installmentCount}>
            {loading ? 'Simulando...' : '🧮 Simular Préstamo'}
          </button>
        </form>

        {simulation && (
          <div className="simulation-results">
            <h2>Resultados</h2>

            <div className="result-card">
              <h3>Información General</h3>
              <div className="result-row"><span>Producto:</span><strong>{simulation.product.name}</strong></div>
              <div className="result-row"><span>Monto Principal:</span><strong>${simulation.principal.toFixed(2)}</strong></div>
              <div className="result-row"><span>Plazo:</span><strong>{simulation.termDays} días</strong></div>
              <div className="result-row"><span>Cuotas:</span><strong>{simulation.installmentCount}</strong></div>
              <div className="result-row"><span>Primer Préstamo:</span><strong>{simulation.isFirstLoan ? 'Sí' : 'No'}</strong></div>
            </div>

            {simulation.fees && Object.keys(simulation.fees).length > 0 && (
              <div className="result-card">
                <h3>Comisiones (Fees)</h3>
                {Object.entries(simulation.fees).map(([key, fee]) => (
                  <div key={key} className="fee-item">
                    <div className="fee-header">
                      <strong>{fee.name}</strong>
                      <span className="badge badge-info">{fee.type}</span>
                    </div>
                    <div className="result-row"><span>Monto Original:</span><span>${fee.originalAmount.toFixed(2)}</span></div>
                    {fee.discountAmount > 0 && (
                      <div className="result-row"><span>Descuento:</span><span className="discount-amount">-${fee.discountAmount.toFixed(2)}</span></div>
                    )}
                    <div className="result-row"><span>Monto Final:</span><strong>${fee.finalAmount.toFixed(2)}</strong></div>
                    <div className="result-row">
                      <span>Cálculo:</span>
                      <span>{fee.config?.calculationType === 'PERCENTAGE' ? `${fee.config.value}%` : `$${fee.config?.value}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {simulation.discounts && Object.keys(simulation.discounts).length > 0 && (
              <div className="result-card">
                <h3>Descuentos Aplicados</h3>
                {Object.entries(simulation.discounts).map(([key, d]) => (
                  <div key={key} className="discount-item">
                    <div className="fee-header">
                      <strong>{d.name}</strong>
                      {d.isFirstLoanOnly && <span className="badge badge-success">Primer préstamo</span>}
                    </div>
                    <div className="result-row">
                      <span>Tipo:</span><span>{d.calculationType === 'PERCENTAGE' ? `${d.value}%` : `$${d.value}`}</span>
                    </div>
                    <div className="result-row">
                      <span>Total descuento:</span><strong className="discount-amount">-${d.totalDiscountAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="result-card summary-card">
              <h3>Resumen</h3>
              <div className="result-row"><span>Total Fees (bruto):</span><span>${simulation.summary.totalFeesOriginal.toFixed(2)}</span></div>
              {simulation.summary.totalPercentageDiscounts > 0 && (
                <div className="result-row"><span>Desc. porcentuales:</span><span className="discount-amount">-${simulation.summary.totalPercentageDiscounts.toFixed(2)}</span></div>
              )}
              {simulation.summary.totalFixedDiscounts > 0 && (
                <div className="result-row"><span>Desc. fijos:</span><span className="discount-amount">-${simulation.summary.totalFixedDiscounts.toFixed(2)}</span></div>
              )}
              <div className="result-row"><span>Total descuentos:</span><strong className="discount-amount">-${simulation.summary.totalDiscounts.toFixed(2)}</strong></div>
              <div className="result-row"><span>Fees netos:</span><span>${simulation.summary.totalFeesResult.toFixed(2)}</span></div>
              <div className="result-row"><span>IGV:</span><span>${simulation.summary.totalIgvFromTotalFeesResult.toFixed(2)}</span></div>
              <div className="result-row total-row">
                <span>TOTAL A PAGAR:</span>
                <strong>${simulation.summary.totalToPay.toFixed(2)}</strong>
              </div>
            </div>

            {simulation.schedule?.length > 0 && (
              <div className="result-card">
                <h3>Cronograma de Pagos</h3>
                <table className="schedule-table">
                  <thead>
                    <tr><th>Cuota</th><th>Vencimiento</th><th>Monto</th></tr>
                  </thead>
                  <tbody>
                    {simulation.schedule.map(inst => (
                      <tr key={inst.installmentNo}>
                        <td>{inst.installmentNo}</td>
                        <td>{inst.dueDate}</td>
                        <td>${inst.amount.toFixed(2)}</td>
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
