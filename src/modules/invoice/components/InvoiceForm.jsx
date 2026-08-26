import { DocumentForm } from '../../../core/documentEngine';
import { useInvoices } from '../context/InvoiceContext';

const InvoiceForm = (props) => {
  const { invoices, config } = useInvoices();
  return <DocumentForm items={invoices} config={config} {...props} />;
};

export default InvoiceForm;
