/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import api from '../../api';
import GroupForm, { GroupPayload } from '../../components/groups/GroupForm';

export default function AddGroupPage() {
  const navigate = useNavigate();

  // Called by GroupForm when the user submits valid data
  const handleSubmit = async (data: GroupPayload) => {
    try {
      await api.post('/groups', data);
      navigate('/groups');
    } catch (err: any) {
      // You can enhance this to show an error toast or pass a submit error
      console.error('Failed to create group:', err);
    }
  };

  // Called by GroupForm when the user cancels
  const handleCancel = () => {
    navigate('/groups');
  };

  return (
    <>
      <PageMeta title="Ajouter un groupe" description="Formulaire d'ajout d'un nouveau groupe" />
      <PageBreadcrumb pageTitle="Ajouter un groupe" />
      <GroupForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </>
  );
}
