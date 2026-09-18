import { DocumentTable } from '../../../core/documentEngine';
import { useProforma } from '../context/ProformaContext';

const ProformaTable = ({ proformas: propProformas, onCreateClick, onConvertToInvoice }) => {
  const { proformaInvoices: contextProformas, deleteProforma, updateProforma, config } = useProforma();
  const items = propProformas || contextProformas;

  return (
    <DocumentTable
      items={items}
      onDelete={deleteProforma}
      onUpdate={updateProforma}
      onCreateClick={onCreateClick}
      config={config}
      onConvertToInvoice={onConvertToInvoice}
    />
  );
};

export default ProformaTable;
