import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './modules/auth';
import { InvoiceProvider } from './modules/invoice';
import { ProformaProvider } from './modules/proforma';
import { ClientProvider } from './modules/client';
import { CompanySettingsProvider } from './components/Layout/CompanySettingsContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CompanySettingsProvider>
          <ClientProvider>
            <InvoiceProvider>
              <ProformaProvider>
                <AppRoutes />
              </ProformaProvider>
            </InvoiceProvider>
          </ClientProvider>
        </CompanySettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;