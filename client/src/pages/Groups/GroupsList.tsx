import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { GroupDTO } from '../../models/Group';
import { TeacherDTO } from '../../models/Teacher';
import GroupCardExpanded from '../../components/groups/ExpandedGroupCard';

export default function GroupsList() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [teachers, setTeachers] = useState<TeacherDTO[]>([]);
  const [profitMap, setProfitMap] = useState<Record<string, number | null>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupsRes, teachersRes] = await Promise.all([
          api.get<GroupDTO[]>('/groups'),
          api.get<TeacherDTO[]>('/teachers')
        ]);
        setGroups(groupsRes.data);
        setTeachers(teachersRes.data);
      } catch (err) {
        console.error('Error fetching groups or teachers:', err);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      {/* Add Group Button */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6 flex justify-center">
        <button
          onClick={() => navigate('/groups/add')}
          className="text-sm font-medium py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Ajouter un groupe
        </button>
      </div>

      {/* Group Cards List (one per row) */}
      <div className="flex flex-col grid grid-cols-2 gap-6">
        {groups.map(group => {
          const teacher = teachers.find(t => String(t.id) === String(group.teacherId));
          const professorName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Aucun professeur';
          return (
            <GroupCardExpanded
              group={group}
              teacherName={professorName}
              onUpdated={updatedGroup => {
                setGroups(prev => prev.map(g => (g.id === updatedGroup.id ? updatedGroup : g)));
              }}
            />
          );
        })}
      </div>
    </>
  );
}
