import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductAmounts from './pages/ProductAmounts';
import ProductTerms from './pages/ProductTerms';
import ProductInstallmentOptions from './pages/ProductInstallmentOptions';
import CreditScoreRanges from './pages/CreditScoreRanges';
import FeeDefinitions from './pages/FeeDefinitions';
import ProductFeeConfigs from './pages/ProductFeeConfigs';
import DiscountDefinitions from './pages/DiscountDefinitions';
import ProductDiscountConfigs from './pages/ProductDiscountConfigs';
import Simulator from './pages/Simulator';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="product-amounts" element={<ProductAmounts />} />
          <Route path="product-terms" element={<ProductTerms />} />
          <Route path="product-installment-options" element={<ProductInstallmentOptions />} />
          <Route path="credit-score-ranges" element={<CreditScoreRanges />} />
          <Route path="fee-definitions" element={<FeeDefinitions />} />
          <Route path="product-fee-configs" element={<ProductFeeConfigs />} />
          <Route path="discount-definitions" element={<DiscountDefinitions />} />
          <Route path="product-discount-configs" element={<ProductDiscountConfigs />} />
          <Route path="simulator" element={<Simulator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
