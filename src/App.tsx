import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Cars from '@/pages/Cars';
import Customers from '@/pages/Customers';
import Rentals from '@/pages/Rentals';
import Payments from '@/pages/Payments';
import Reports from '@/pages/Reports';
import { Layout } from './components/Layout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cars" element={<Cars />} />
          <Route path="customers" element={<Customers />} />
          <Route path="rentals" element={<Rentals />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}
