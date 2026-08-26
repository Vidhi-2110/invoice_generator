import { useState } from 'react';
import { useProforma } from '../context/ProformaContext';
import ProformaTable from '../components/ProformaTable';
import ProformaForm from '../components/ProformaForm';
import { FiPlus } from 'react-icons/fi';

const ProformaPage = () => {
  const { proformaInvoices, addProforma, config } = useProforma();
  const [showForm, setShowForm] = useState(false);

  const handleSave = (proformaData) => {
    addProforma({
      ...proformaData,
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
            <p className="text-xs text-slate-400 mt-1">Manage and track your preliminary {config.title.toLowerCase()} estimates.</p>
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
          <ProformaForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <div className="animate-fade-in">
          <ProformaTable
            proformas={proformaInvoices}
            onCreateClick={() => setShowForm(true)}
          />
        </div>
      )}
    </div>
  );
};

export default ProformaPage;
