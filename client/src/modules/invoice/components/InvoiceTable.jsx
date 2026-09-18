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

    const referenceNo = updatedData.referenceNo || updatedData.sourceProformaNumber;
    if (!referenceNo) return;

    const proformaNumbers = referenceNo.split(',').map((s) => s.trim()).filter(Boolean);

    proformaNumbers.forEach((proformaNumber) => {
      const linkedProforma = proformaInvoices.find(
        (pi) => pi.invoiceNumber === proformaNumber
      );
      if (!linkedProforma) return;

      const newProformaStatus = updatedData.status === 'Paid' ? 'Approved' : 'Pending';
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
