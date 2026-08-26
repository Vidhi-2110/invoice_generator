import { DocumentPreview } from '../../../core/documentEngine';
import { useInvoices } from '../context/InvoiceContext';

const InvoicePreview = ({ invoice: propInvoice }) => {
  const { config } = useInvoices();
  return <DocumentPreview item={propInvoice} config={config} />;
};

export default InvoicePreview;
