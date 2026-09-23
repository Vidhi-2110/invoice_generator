
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
    updateInvoice(id, updatedData);

    // Collect all proforma numbers linked to this invoice from every possible field:
    //  1. proformaRefs  — new array field (invoices created via client auto-fill)
    //  2. referenceNo   — legacy comma-separated string from the old reference dropdown
    //  3. sourceProformaNumber — legacy single ref from convert-to-invoice flow
    const proformaNumbers = new Set();

    if (Array.isArray(updatedData.proformaRefs)) {
      updatedData.proformaRefs.forEach((n) => n && proformaNumbers.add(n.trim()));
    }
    if (updatedData.referenceNo) {
      updatedData.referenceNo.split(',').map((s) => s.trim()).filter(Boolean)
        .forEach((n) => proformaNumbers.add(n));
    }
    if (updatedData.sourceProformaNumber) {
      proformaNumbers.add(updatedData.sourceProformaNumber.trim());
    }

    if (proformaNumbers.size === 0) return;

    const newProformaStatus = updatedData.status === 'Paid' ? 'Approved' : 'Pending';

    proformaNumbers.forEach((proformaNumber) => {
      const linkedProforma = proformaInvoices.find(
        (pi) => pi.invoiceNumber === proformaNumber
      );
      if (!linkedProforma) return;
      if (linkedProforma.status !== newProformaStatus) {
        updateProforma(linkedProforma.id, { ...linkedProforma, status: newProformaStatus });
      }
    });
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
