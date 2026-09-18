import { DocumentForm } from '../../../core/documentEngine';
import { useInvoices } from '../context/InvoiceContext';
import { useProforma } from '../../proforma/context/ProformaContext';

const InvoiceForm = (props) => {
  const { invoices, config } = useInvoices();
  const { proformaInvoices } = useProforma();

  // Build the dropdown options from existing proforma invoice numbers
  const referenceNoOptions = proformaInvoices.map((pi) => pi.invoiceNumber).filter(Boolean);

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
