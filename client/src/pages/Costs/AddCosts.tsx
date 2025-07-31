import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import CostForm, { CostPayload, Mode, TemplatePayload } from '../../components/costs/CostForm';
import api from '../../api';

export default function AddCostPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: CostPayload | TemplatePayload, mode: Mode) => {
    try {
      if (mode === 'single') {
        await api.post('/costs', data as CostPayload);
      } else {
        // Recurring template
        const tmplRes = await api.post('/cost-templates', data as TemplatePayload);
        const newTemplate = tmplRes.data;

        // Automatically insert first cost if startDate provided
        const { startDate, notes, name, amount } = data as TemplatePayload;
        if (startDate) {
          await api.post('/costs', {
            costTemplateId: newTemplate.id,
            name: newTemplate.name,
            dueDate: startDate,
            amount: newTemplate.amount,
            paid: false,
            notes: newTemplate.notes ?? null
          });
        }
      }
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
