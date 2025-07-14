import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import StudentCard from '../../components/students/StudentCard';
import api from '../../api';
import { StudentDTO } from '../../models/Student';
import { GroupNameDTO } from '../../models/Group';

export default function StudentsList() {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [groups, setGroups] = useState<GroupNameDTO[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, groupsRes] = await Promise.all([
          api.get('/students'),
          api.get('/groups')
        ]);
        setStudents(studentsRes.data);
        setGroups(groupsRes.data);
      } catch (error) {
        console.error('Error fetching students or groups:', error);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = (updated: StudentDTO) => {
    setStudents(students.map(s => s.id === updated.id ? updated : s));
  };

  return (
    <>
      <PageMeta title="Étudiants" description="Liste des étudiants" />
      <PageBreadcrumb pageTitle="Étudiants" />
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6 flex justify-center">
        <button
          onClick={() => navigate('/students/add')}
          className="text-sm font-medium py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Ajouter un étudiant
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {students.map(student => {
          const group = groups.find(g => String(g.id) === String(student.groupId));
          return (
              <StudentCard
                key={student.id}
                student={student}
                onUpdated={handleUpdate}
                groupName={group ? group.name : 'Aucun groupe'}
              />)
        })}
      </div>
    </>
  );
}