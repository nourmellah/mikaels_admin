import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import TeacherCard from '../../components/teachers/TeacherCard';
import TeacherInfo from '../../components/teachers/TeacherInfo';
import api from '../../api';
import { TeacherDTO } from '../../models/Teacher';
import TeacherPayments from '../../components/teachers/TeacherPayments';

export default function TeacherProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get<TeacherDTO>(`/teachers/${id}`);
        setTeacher(res.data);
      } catch (err) {
        console.error('Error fetching teacher:', err);
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error || !teacher) return <div>{error || 'Professeur non trouvé.'}</div>;

  const handleUpdate = (updated: TeacherDTO) => setTeacher(updated);

  const handleDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer ce professeur ?")) {
      try {
        await api.delete(`/teachers/${id}`);
        navigate('/teachers', { replace: true });
      } catch (err) {
        console.error('Erreur de suppression :', err);
      }
    }
  };

  return (
    <>
      <PageMeta
        title={`Profil de ${teacher.firstName} ${teacher.lastName}`}
        description={`Détails du profil de ${teacher.firstName} ${teacher.lastName}`}
      />
      <PageBreadcrumb pageTitle="Profil professeur" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 space-y-6">
        <TeacherCard
          teacher={teacher}
          phone={teacher.phone || '–'}
          onUpdated={handleUpdate}
        />
        {/** Teacher payments */}
        <TeacherPayments teacherId={teacher.id} />
        <TeacherInfo teacher={teacher} />
        <div className="flex justify-end">
          <button
            onClick={handleDelete}
            className="text-sm font-medium py-2.5 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Supprimer le professeur
          </button>
        </div>
      </div>
    </>
  );
}
