import { useParams } from 'react-router-dom';
import { useInvoices } from '../context/InvoiceContext';
import InvoicePreview from '../components/InvoicePreview';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const { getInvoice } = useInvoices();
  const invoice = getInvoice(id);

  return <InvoicePreview invoice={invoice} />;
};

export default InvoiceDetailPage;
