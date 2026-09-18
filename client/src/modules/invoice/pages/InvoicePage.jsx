import { useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import InvoiceTable from '../components/InvoiceTable';
import InvoiceForm from '../components/InvoiceForm';
import { FiPlus } from 'react-icons/fi';

const InvoicePage = () => {
  const { invoices, addInvoice, config } = useInvoices();
  const [showForm, setShowForm] = useState(false);

  const handleSave = (invoiceData) => {
    addInvoice({
      ...invoiceData,
      status: 'Pending'
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{config.title}s</h2>
            <p className="text-xs text-slate-400 mt-1">Manage and track your issued corporate {config.title.toLowerCase()}s.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 active:scale-95 transition-all self-start sm:self-auto"
          >
            <FiPlus size={16} />
            <span>New {config.title}</span>
          </button>
        </div>
      )}

      {showForm ? (
        <div className="animate-fade-in">
          <InvoiceForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <div className="animate-fade-in">
          <InvoiceTable
            invoices={invoices}
            onCreateClick={() => setShowForm(true)}
          />
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
