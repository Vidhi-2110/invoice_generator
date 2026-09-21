import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './modules/auth';
import { InvoiceProvider } from './modules/invoice';
import { ProformaProvider } from './modules/proforma';
import { ClientProvider } from './modules/client';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ClientProvider>
          <InvoiceProvider>
            <ProformaProvider>
              <AppRoutes />
            </ProformaProvider>
          </InvoiceProvider>
        </ClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;