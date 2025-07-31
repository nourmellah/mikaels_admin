/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import api from '../../api';
import StudentForm, { StudentPayload } from '../../components/students/StudentForm';

export default function AddStudentPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: StudentPayload) => {
    try {
      // Create the student
      const res = await api.post('/students', data);
      const student = res.data;

      // If assigned to a group, create registration
      if (data.groupId) {
        const grpRes = await api.get(`/groups/${data.groupId}`);
        const agreedPrice = grpRes.data.price;
        const today = new Date().toISOString().split('T')[0];

        console.log('Creating registration for student:', student.id, 'in group:', data.groupId);

        await api.post('/registrations', {
          student_id: student.id,        // ← snake_case
          group_id: data.groupId,      // ← snake_case
          agreed_price: agreedPrice,       // ← snake_case
          deposit_pct: 0,                // default or data.depositPct
          discount_amount: 0,                 // or data.discountAmount
          registration_date: today,             // ← snake_case
          status: 'active',
        });
      }

      navigate('/students');
    } catch (err: any) {
      console.error('Failed to create student or registration:', err);
    }
  };

  const handleCancel = () => {
    navigate('/students');
  };

  return (
    <>
      <PageMeta
        title="Ajouter un étudiant"
        description="Formulaire d'ajout d'un nouvel étudiant"
      />
      <PageBreadcrumb pageTitle="Ajouter un étudiant" />

      <StudentForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </>
  );
}
