import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import api from '../../api';
import StudentForm, { StudentPayload } from '../../components/students/StudentForm';

export default function AddStudentPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: StudentPayload) => {
    try {
      await api.post('/students', data);
      navigate('/students', { replace: true });
    } catch (err) {
      console.error('Create student error:', err);
    }
  };

  const handleCancel = () => {
    navigate('/students', { replace: true });
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
