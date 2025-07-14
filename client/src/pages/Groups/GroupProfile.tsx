import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import GroupCard from '../../components/groups/GroupCard';
import GroupInfo from '../../components/groups/GroupInfo';
import TeacherCard from '../../components/teachers/TeacherCard';
import StudentCard from '../../components/students/StudentCard';
import api from '../../api';
import ComponentCard from '../../components/common/ComponentCard';
import { GroupDTO } from '../../models/Group';
import { TeacherDTO } from '../../models/Teacher';
import { StudentDTO } from '../../models/Student';

export default function GroupProfile() {
	const { id } = useParams<{ id: string }>();
	const [group, setGroup] = useState<GroupDTO | null>(null);
	const [teacher, setTeacher] = useState<TeacherDTO | null>(null);
	const [students, setStudents] = useState<StudentDTO[]>([]);

	useEffect(() => {
		async function fetchData() {
			// fetch group
			const grpRes = await api.get<GroupDTO>(`/groups/${id}`);
			setGroup(grpRes.data);
			// fetch teacher
			if (grpRes.data.teacherId) {
				const tRes = await api.get<TeacherDTO>(`/teachers/${grpRes.data.teacherId}`);
				setTeacher(tRes.data);
			}
			// fetch students and filter by group
			const sRes = await api.get<StudentDTO[]>('/students');
			setStudents(sRes.data.filter(s => String(s.groupId) === String(id)));
		}
		if (id) fetchData();
	}, [id]);

	if (!group) return <div>Chargement...</div>;

	const handleGroupUpdate = (updated: GroupDTO) => setGroup(updated);
	const handleTeacherUpdate = (updated: TeacherDTO) => setTeacher(updated);
	const handleStudentUpdate = (updated: StudentDTO) =>
		setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));

	return (
		<>
			<PageMeta
				title={`Groupe: ${group.name}`}
				description={`Détails du groupe ${group.name}`}
			/>
			<PageBreadcrumb pageTitle="Profil du groupe" />

			<div className="space-y-6">
				{/* Top card */}
				<GroupCard
					group={group}
					professorName={teacher ? `${teacher.firstName} ${teacher.lastName}` : '–'}
					level={group.level}
					onUpdated={handleGroupUpdate}
				/>

				{/* Cost placeholder */}
				<ComponentCard title="Coûts du groupe" children={undefined} />

				{/* Details section */}
								<ComponentCard title="Détailes du groupe">

				<div className="grid grid-cols-1 gap-6">

					<GroupInfo group={group} />
					<div>
						<h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
							Professeur
						</h4>
						{teacher && (
							<TeacherCard
								teacher={teacher}
								phone={teacher.phone || '–'}
								onUpdated={handleTeacherUpdate}
							/>
						)}
					</div>
					{/* Students list */}
					<div>
						<h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
							Étudiants ({students.length})
						</h4>
						<div className="space-y-4">
							<div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">

								{students.map(student => (
									<StudentCard
										key={student.id}
										student={student}
										groupName={group.name}
										onUpdated={handleStudentUpdate}
									/>
								))}
								{students.length === 0 && (
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Aucun étudiant dans ce groupe.
									</p>
								)} 
							</div>
						</div>
					</div>
				</div>
				</ComponentCard>
			</div>
		</>
	);
}
