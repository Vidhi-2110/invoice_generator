import { useParams } from 'react-router-dom';
import { useProforma } from '../context/ProformaContext';
import ProformaPreview from '../components/ProformaPreview';

const ProformaDetailPage = () => {
  const { id } = useParams();
  const { getProforma } = useProforma();
  const proforma = getProforma(id);

  return <ProformaPreview proforma={proforma} />;
};

export default ProformaDetailPage;
