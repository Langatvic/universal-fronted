import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Purchasing from './pages/Purchasing';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';         
import PaymentMethods from './pages/PaymentMethods'; 
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<MainLayout />}>
          {/* Everyone */}
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />

          {/* Super Admin, Admin */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin']} />}>
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchasing" element={<Purchasing />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Super Admin ONLY */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="employees" element={<Employees />} />
            <Route path="settings" element={<Settings />} />
            <Route path="audit-logs" element={<AuditLogs />} /> 
            <Route path="payment-methods" element={<PaymentMethods />} />          
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;