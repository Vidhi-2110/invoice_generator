import { DocumentTable } from '../../../core/documentEngine';
import { useInvoices } from '../context/InvoiceContext';

const InvoiceTable = ({ invoices: propInvoices, onCreateClick }) => {
  const { invoices: contextInvoices, deleteInvoice, updateInvoice, config } = useInvoices();
  const items = propInvoices || contextInvoices;

  return (
    <DocumentTable
      items={items}
      onDelete={deleteInvoice}
      onUpdate={updateInvoice}
      onCreateClick={onCreateClick}
      config={config}
    />
  );
};

export default InvoiceTable;
