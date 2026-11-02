import { DocumentForm } from '../../../core/documentEngine';
import { useInvoices } from '../context/InvoiceContext';
import { useProforma } from '../../proforma/context/ProformaContext';

const InvoiceForm = (props) => {
  const { invoices, config } = useInvoices();
  const { proformaInvoices } = useProforma();

  // Collect all proforma numbers that have already been converted into invoices
  const invoicedProformaNumbers = new Set();
  (invoices || []).forEach((inv) => {
    // If editing, don't treat the current invoice's own referenced proformas as unavailable
    if (props.isEdit && props.initialData?.id && inv.id === props.initialData.id) {
      return;
    }
    if (Array.isArray(inv.proformaRefs)) {
      inv.proformaRefs.forEach((n) => n && invoicedProformaNumbers.add(n.trim()));
    }
    if (inv.referenceNo) {
      inv.referenceNo
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((n) => invoicedProformaNumbers.add(n));
    }
    if (inv.sourceProformaNumber) {
      invoicedProformaNumbers.add(inv.sourceProformaNumber.trim());
    }
  });

  // Build the dropdown options ONLY from active, unconverted, and unapproved/unpaid proforma invoices
  const referenceNoOptions = proformaInvoices
    .filter((pi) => {
      // Exclude Approved or Paid proformas (already completed/paid)
      if (pi.status === 'Approved' || pi.status === 'Paid') return false;
      const num = (pi.invoiceNumber || pi.proformaNumber || '').trim();
      if (!num) return false;
      // Exclude proformas already linked to an existing invoice
      return !invoicedProformaNumbers.has(num);
    })
    .map((pi) => pi.invoiceNumber)
    .filter(Boolean);

  return (
    <DocumentForm
      items={invoices}
      config={config}
      referenceNoOptions={referenceNoOptions}
      referenceNoData={proformaInvoices}
      {...props}
    />
  );
};

export default InvoiceForm;
