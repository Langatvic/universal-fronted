
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

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* All dashboard pages require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />

            {/* Owner, admin and manager */}
            <Route element={
              <ProtectedRoute allowedRoles={['owner', 'admin', 'manager']} />
            }>
              <Route path="inventory" element={<Inventory />} />
              <Route path="purchasing" element={<Purchasing />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Owner and admin */}
            <Route element={
              <ProtectedRoute allowedRoles={['owner', 'admin']} />
            }>
              <Route path="employees" element={<Employees />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
