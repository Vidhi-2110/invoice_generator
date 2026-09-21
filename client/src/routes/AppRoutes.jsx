import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { DashboardPage } from '../modules/dashboard';
import { 
  InvoicePage, 
  InvoiceDetailPage, 
  InvoiceEditPage,
  useInvoices 
} from '../modules/invoice';
import { 
  ProformaPage, 
  ProformaDetailPage, 
  ProformaEditPage,
  useProforma 
} from '../modules/proforma';
import { ClientPage } from '../modules/client';
import { LoginPage, RegisterPage, ProtectedRoute } from '../modules/auth';

const DashboardRoute = () => {
  const { invoices } = useInvoices();
  const { proformaInvoices } = useProforma();
  return <DashboardPage invoices={invoices} proformaInvoices={proformaInvoices} />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Redirect from / to /dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardRoute />} />
        
        {/* Invoices */}
        <Route path="invoice" element={<InvoicePage />} />
        <Route path="invoice/:id" element={<InvoiceDetailPage />} />
        <Route path="invoice/:id/edit" element={<InvoiceEditPage />} />
        
        {/* Proforma Invoices */}
        <Route path="proforma-invoice" element={<ProformaPage />} />
        <Route path="proforma-invoice/:id" element={<ProformaDetailPage />} />
        <Route path="proforma-invoice/:id/edit" element={<ProformaEditPage />} />
        
        {/* Client Management */}
        <Route path="clients" element={<ClientPage />} />
        
        {/* Fallback redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
