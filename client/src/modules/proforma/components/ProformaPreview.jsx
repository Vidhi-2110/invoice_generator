import { DocumentPreview } from '../../../core/documentEngine';
import { useProforma } from '../context/ProformaContext';

const ProformaPreview = ({ proforma: propProforma }) => {
  const { config } = useProforma();
  return <DocumentPreview item={propProforma} config={config} />;
};

export default ProformaPreview;
