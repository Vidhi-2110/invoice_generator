import { useParams, useNavigate } from 'react-router-dom';
import { useProforma } from '../context/ProformaContext';
import ProformaForm from '../components/ProformaForm';

const ProformaEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProforma, updateProforma, config } = useProforma();
  const proforma = getProforma(id);

  const handleSave = (updatedData) => {
    updateProforma(id, updatedData);
    navigate(config.proformaRoute || '/proforma-invoice');
  };

  if (!proforma) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 max-w-xl mx-auto shadow-sm">
        <p className="text-sm font-semibold text-slate-500">{config.title} record not found.</p>
        <button
          onClick={() => navigate(config.proformaRoute || '/proforma-invoice')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <ProformaForm
      initialData={proforma}
      onSave={handleSave}
      onCancel={() => navigate(config.proformaRoute || '/proforma-invoice')}
      isEdit={true}
    />
  );
};

export default ProformaEditPage;
