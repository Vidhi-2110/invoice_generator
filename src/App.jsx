import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './modules/auth';
import { InvoiceProvider } from './modules/invoice';
import { ProformaProvider } from './modules/proforma';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <InvoiceProvider>
          <ProformaProvider>
            <AppRoutes />
          </ProformaProvider>
        </InvoiceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;