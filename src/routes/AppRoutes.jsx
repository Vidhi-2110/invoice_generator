import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
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

const DashboardRoute = () => {
  const { invoices } = useInvoices();
  const { proformaInvoices } = useProforma();
  return <DashboardPage invoices={invoices} proformaInvoices={proformaInvoices} />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
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
        
        {/* Fallback redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
