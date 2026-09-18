import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoiceContext';
import InvoiceForm from '../components/InvoiceForm';

const InvoiceEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInvoice, updateInvoice, config } = useInvoices();
  const invoice = getInvoice(id);

  const handleSave = (updatedData) => {
    updateInvoice(id, updatedData);
    navigate(config.invoiceRoute || '/invoice');
  };

  if (!invoice) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 max-w-xl mx-auto shadow-sm">
        <p className="text-sm font-semibold text-slate-500">{config.title} not found.</p>
        <button
          onClick={() => navigate(config.invoiceRoute || '/invoice')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <InvoiceForm
      initialData={invoice}
      onSave={handleSave}
      onCancel={() => navigate(config.invoiceRoute || '/invoice')}
      isEdit={true}
    />
  );
};

export default InvoiceEditPage;
