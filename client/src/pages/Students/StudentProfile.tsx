import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import StudentCard from '../../components/students/StudentCard';
import StudentInfo from '../../components/students/StudentInfo';
import api from '../../api';
import { StudentDTO } from '../../models/Student';
import { GroupNameDTO } from '../../models/Group';

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDTO | null>(null);
  const [groups, setGroups] = useState<GroupNameDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentRes, groupsRes] = await Promise.all([
          api.get<StudentDTO>(`/students/${id}`),
          api.get<GroupNameDTO[]>('/groups'),
        ]);
        setStudent(studentRes.data);
        setGroups(groupsRes.data);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error || !student) return <div>{error || 'Étudiant non trouvé.'}</div>;

  const group = groups.find(g => String(g.id) === String(student.groupId));
  const groupName = group ? group.name : 'Aucun groupe';

  const handleUpdate = (updated: StudentDTO) => setStudent(updated);

  const handleDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer cet étudiant ?")) {
      try {
        await api.delete(`/students/${id}`);
        navigate('/students', { replace: true });
      } catch (err) {
        console.error('Erreur de suppression :', err);
      }
    }
  };

  return (
    <>
      <PageMeta
        title={`Profil de ${student.firstName} ${student.lastName}`}
        description={`Détails du profil de ${student.firstName} ${student.lastName}`}
      />
      <PageBreadcrumb pageTitle="Profil étudiant" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 space-y-6">
        <StudentCard
          student={student}
          groupName={groupName}
          onUpdated={handleUpdate}
        />
        <StudentInfo student={student} groupName={groupName} />
        <div className="flex justify-end">
          <button
            onClick={handleDelete}
            className="text-sm font-medium py-2.5 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Supprimer l'étudiant
          </button>
        </div>
      </div>
    </>
  );
}
