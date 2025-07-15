import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import CostForm, { CostPayload } from '../../components/costs/CostForm';
import api from '../../api';

export default function AddCostPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: CostPayload) => {
    try {
      await api.post('/costs', data);
      navigate('/costs', { replace: true });
    } catch (err) {
      console.error('Erreur lors de la création du coût:', err);
    }
  };

  const handleCancel = () => {
    navigate('/costs', { replace: true });
  };

  return (
    <>
      <PageMeta
        title="Ajouter un coût"
        description="Formulaire pour créer un nouveau coût"
      />
      <PageBreadcrumb pageTitle="Ajouter un coût" />

      <CostForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </>
  );
}
