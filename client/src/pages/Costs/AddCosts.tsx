/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import CostForm, { CostPayload, Mode, TemplatePayload } from '../../components/costs/CostForm';

export default function AddCostPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: CostPayload | TemplatePayload, mode: Mode) => {
    try {
      navigate('/costs', { replace: true });
    } catch (err) {
      console.error('Erreur lors de la création :', err);
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
