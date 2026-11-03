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
import ProtectedRoute from './components/ProtectedRoute'; // <-- Import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<MainLayout />}>
          {/* Everyone can see Dashboard & Sales */}
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />

          {/* Admin & Manager ONLY */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="purchasing" element={<Purchasing />} />
          </Route>

          {/* Admin ONLY */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="employees" element={<Employees />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;