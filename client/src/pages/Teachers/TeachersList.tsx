import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherCard from '../../components/teachers/TeacherCard';
import api from '../../api';
import { TeacherDTO } from '../../models/Teacher';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const TeachersList: React.FC = () => {
	const navigate = useNavigate();
	const [teachers, setTeachers] = useState<TeacherDTO[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const teachersRes = await api.get<TeacherDTO[]>('/teachers');
				setTeachers(teachersRes.data);
			} catch (error) {
				console.error('Error fetching teachers:', error);
			}
		};
		fetchData();
	}, []);

	return (
		<>
		  <PageMeta title="Professeurs" description="Liste des professeurs" />
      <PageBreadcrumb pageTitle="Professeurs" />

			{/* Add Teacher Button */}
			<div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6 flex justify-center">
				<button
					onClick={() => navigate('/teachers/add')}
					className="text-sm font-medium py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
				>
					Ajouter un professeur
				</button>
			</div>

			{/* Teacher Cards Grid */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2">
				{teachers.map(teacher => (
					<TeacherCard
						teacher={teacher}
						onUpdated={updated => {
							setTeachers(prev => prev.map(t => (t.id === updated.id ? updated : t)));
						}} phone={''} />
				))}
			</div>
		</>
	);
};

export default TeachersList;
