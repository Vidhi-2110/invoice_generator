import { DocumentTable } from '../../../core/documentEngine';
import { useProforma } from '../context/ProformaContext';
import { useInvoices } from '../../invoice/context/InvoiceContext';

const ProformaTable = ({ proformas: propProformas, onCreateClick, onConvertToInvoice }) => {
  const { proformaInvoices: contextProformas, deleteProforma, updateProforma, config } = useProforma();
  const { invoices, updateInvoice } = useInvoices();
  const items = propProformas || contextProformas;

  /**
   * Wraps updateProforma to also sync linked invoice status.
   *
   * Mapping logic:
   *   Proforma "Approved" → linked Invoice(s) become "Paid"
   *   Proforma "Pending"  → linked Invoice(s) revert to "Pending"
   */
  const handleUpdate = (id, updatedData) => {
    updateProforma(id, updatedData);

    const proformaNumber = updatedData.invoiceNumber;
    if (!proformaNumber) return;

    // Find all invoices that reference this proforma in their proformaRefs array
    const linkedInvoices = invoices.filter(
      (inv) =>
        (Array.isArray(inv.proformaRefs) && inv.proformaRefs.includes(proformaNumber)) ||
        inv.referenceNo?.split(',').map((s) => s.trim()).includes(proformaNumber) ||
        inv.sourceProformaNumber === proformaNumber
    );

    linkedInvoices.forEach((inv) => {
      const newInvoiceStatus = updatedData.status === 'Approved' ? 'Paid' : 'Pending';
      if (inv.status !== newInvoiceStatus) {
        updateInvoice(inv.id, { ...inv, status: newInvoiceStatus });
      }
    });
  };

  return (
    <DocumentTable
      items={items}
      onDelete={deleteProforma}
      onUpdate={handleUpdate}
      onCreateClick={onCreateClick}
      config={config}
      onConvertToInvoice={onConvertToInvoice}
    />
  );
};

export default ProformaTable;

