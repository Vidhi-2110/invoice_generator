import { DocumentForm } from '../../../core/documentEngine';
import { useProforma } from '../context/ProformaContext';

const ProformaForm = (props) => {
  const { proformaInvoices, config } = useProforma();
  return <DocumentForm items={proformaInvoices} config={config} {...props} />;
};

export default ProformaForm;
