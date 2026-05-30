import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';

const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Inventory = lazy(() => import('./pages/Inventory').then(m => ({ default: m.Inventory })));
const Forecast = lazy(() => import('./pages/Forecast').then(m => ({ default: m.Forecast })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Recommendations = lazy(() => import('./pages/Recommendations').then(m => ({ default: m.Recommendations })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const CctvAnalytics = lazy(() => import('./pages/CctvAnalytics').then(m => ({ default: m.CctvAnalytics })));

const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[300px]">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/cctv-analytics" element={<CctvAnalytics />} />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
