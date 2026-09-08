import { DocumentTable } from '../../../core/documentEngine';
import { useInvoices } from '../context/InvoiceContext';
import { useProforma } from '../../../modules/proforma/context/ProformaContext';

const InvoiceTable = ({ invoices: propInvoices, onCreateClick }) => {
  const { invoices: contextInvoices, deleteInvoice, updateInvoice, config } = useInvoices();
  const { proformaInvoices, updateProforma } = useProforma();

  const items = propInvoices || contextInvoices;

  /**
   * Wraps updateInvoice to also sync the linked proforma invoice status.
   *
   * Mapping logic:
   *   Invoice "Paid"    → linked Proforma becomes "Approved"
   *   Invoice "Pending" → linked Proforma reverts to "Pending"
   */
  const handleUpdate = (id, updatedData) => {
    // Save the invoice first
    updateInvoice(id, updatedData);

    // Check if this invoice was converted from a proforma
    const sourceProformaNumber = updatedData.sourceProformaNumber;
    if (!sourceProformaNumber) return;

    // Find the linked proforma by its invoiceNumber
    const linkedProforma = proformaInvoices.find(
      (pi) => pi.invoiceNumber === sourceProformaNumber
    );
    if (!linkedProforma) return;

    // Map invoice status → proforma status
    const newProformaStatus = updatedData.status === 'Paid' ? 'Approved' : 'Pending';

    // Only update if status actually needs to change
    if (linkedProforma.status !== newProformaStatus) {
      updateProforma(linkedProforma.id, {
        ...linkedProforma,
        status: newProformaStatus,
      });
    }
  };

  return (
    <DocumentTable
      items={items}
      onDelete={deleteInvoice}
      onUpdate={handleUpdate}
      onCreateClick={onCreateClick}
      config={config}
    />
  );
};

export default InvoiceTable;
