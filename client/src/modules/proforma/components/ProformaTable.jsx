import { DocumentTable } from '../../../core/documentEngine';
import { useProforma } from '../context/ProformaContext';

// A proforma's status is not edited here. It follows its invoice: marking an
// invoice Paid approves the proforma (see InvoiceTable). Updates that reach this
// table, such as "email sent", must not change any invoice.
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

