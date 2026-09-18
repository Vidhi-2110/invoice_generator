import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProforma } from '../context/ProformaContext';
import { useInvoices } from '../../invoice/context/InvoiceContext';
import ProformaTable from '../components/ProformaTable';
import ProformaForm from '../components/ProformaForm';
import { FiPlus, FiX, FiFileText, FiSave, FiCheckCircle } from 'react-icons/fi';
import { formatCurrency } from '../../../core/utils';

const ConvertModal = ({ proforma, invoiceConfig, onSave, onClose }) => {
  const [referenceNo, setReferenceNo] = useState(proforma.invoiceNumber || '');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [saved, setSaved] = useState(false);

  const lineItemsList =
    proforma.lineItems && proforma.lineItems.length > 0
      ? proforma.lineItems
      : [{ rate: proforma.rate || 0 }];
  const subtotal = lineItemsList.reduce((s, l) => s + (parseFloat(l.rate) || 0), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  const currency = invoiceConfig?.currency || '₹';

  const handleSave = () => {
    onSave({ referenceNo, dueDate });
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FiFileText size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Convert to Invoice</h3>
              <p className="text-[10px] text-indigo-200 mt-0.5">From {proforma.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {saved ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-14 px-6 space-y-4">
            <div className="p-4 rounded-full bg-emerald-50 text-emerald-500">
              <FiCheckCircle size={40} />
            </div>
            <h4 className="text-base font-bold text-slate-800">Invoice Saved!</h4>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              The invoice has been created and saved. You can view it in the Invoices table.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Preview card */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{proforma.name}</p>
                  <p className="text-slate-400 mt-0.5">{proforma.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs">
                  New Invoice
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <div>
                  <p className="text-slate-400">Customer</p>
                  <p className="font-semibold text-slate-700">{proforma.name}</p>
                </div>
                <div>
                  <p className="text-slate-400">GSTIN</p>
                  <p className="font-semibold text-slate-700">{proforma.gstin || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Created Date</p>
                  <p className="font-semibold text-slate-700">{proforma.createdDate}</p>
                </div>
                <div>
                  <p className="text-slate-400">Subtotal</p>
                  <p className="font-bold text-slate-800">{formatCurrency(subtotal, currency)}</p>
                </div>
                <div>
                  <p className="text-slate-400">GST (18%)</p>
                  <p className="font-semibold text-slate-700">{formatCurrency(gst, currency)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total</p>
                  <p className="font-black text-indigo-600 text-sm">{formatCurrency(total, currency)}</p>
                </div>
              </div>
            </div>

            {/* Editable fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Reference No. <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. PO-1234"
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!dueDate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow shadow-indigo-500/20 transition-all active:scale-95"
              >
                <FiSave size={14} />
                Save as Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProformaPage = () => {
  const { proformaInvoices, addProforma, config } = useProforma();
  const { addInvoice, config: invoiceConfig } = useInvoices();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [convertingProforma, setConvertingProforma] = useState(null);

  const handleSaveProforma = (proformaData) => {
    addProforma({ ...proformaData, status: 'Pending' });
    setShowForm(false);
  };

  const handleConvertToInvoice = (proforma) => {
    setConvertingProforma(proforma);
  };

  const handleConfirmConversion = ({ referenceNo, dueDate }) => {
    // Build invoice data from proforma, stripping proforma-specific fields
    const invoiceData = {
      name: convertingProforma.name,
      email: convertingProforma.email,
      phone: convertingProforma.phone,
      address: convertingProforma.address,
      gstin: convertingProforma.gstin,
      createdDate: convertingProforma.createdDate,
      dueDate,
      referenceNo,
      rate: convertingProforma.rate,
      lineItems: convertingProforma.lineItems,
      status: 'Pending',
      sourceProformaNumber: convertingProforma.invoiceNumber,
    };
    addInvoice(invoiceData);
  };

  const handleModalClose = () => {
    setConvertingProforma(null);
    navigate('/invoice');
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{config.title}s</h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage and track your preliminary {config.title.toLowerCase()} estimates.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-semibold text-white shadow-md shadow-violet-600/10 active:scale-95 transition-all self-start sm:self-auto"
          >
            <FiPlus size={16} />
            <span>New {config.title}</span>
          </button>
        </div>
      )}

      {showForm ? (
        <div className="animate-fade-in">
          <ProformaForm onSave={handleSaveProforma} onCancel={() => setShowForm(false)} />
        </div>
      ) : (
        <div className="animate-fade-in">
          <ProformaTable
            proformas={proformaInvoices}
            onCreateClick={() => setShowForm(true)}
            onConvertToInvoice={handleConvertToInvoice}
          />
        </div>
      )}

      {/* Conversion Modal */}
      {convertingProforma && (
        <ConvertModal
          proforma={convertingProforma}
          invoiceConfig={invoiceConfig}
          onSave={handleConfirmConversion}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default ProformaPage;
