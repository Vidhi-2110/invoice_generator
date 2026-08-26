import { BrowserRouter as Router } from 'react-router-dom';
import { InvoiceProvider } from './modules/invoice';
import { ProformaProvider } from './modules/proforma';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <InvoiceProvider>
        <ProformaProvider>
          <AppRoutes />
        </ProformaProvider>
      </InvoiceProvider>
    </Router>
  );
}

export default App;