/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from '../../components/ui/table';
import api from '../../api';
import { Link } from 'react-router-dom';

interface Teacher {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string | null;
	salary: number;
	imageUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

export default function TeachersList() {
	const [teachers, setTeachers] = useState<Teacher[]>([]);

	useEffect(() => {
		api
			.get('/teachers')
			.then(res => setTeachers(res.data))
			.catch(console.error);
	}, []);

	return (
		<>
			<PageMeta
				title="Liste des professeurs"
				description="Affichage de tous les professeurs"
			/>
			<PageBreadcrumb pageTitle="Professeurs" />
			<div className="space-y-6">
				<ComponentCard title="Liste des professeurs">
					<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
						<div className="max-w-full overflow-x-auto">
							<Table>
								<TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
									<TableRow>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
										>
											Nom complet
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
										>
											Courriel
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
										>
											Téléphone
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
										>
											Salaire
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
										>
											Date de création
										</TableCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{teachers.map(teacher => (
										<Link
											key={teacher.id}
											to={`/teachers/${teacher.id}/edit`}
											className="contents"
										>
											<TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
												<TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm text-blue-600">
													{teacher.firstName} {teacher.lastName}
												</TableCell>
												<TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm text-blue-600">
													{teacher.email}
												</TableCell>
												<TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm text-blue-600">
													{teacher.phone || '-'}
												</TableCell>
												<TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm text-blue-600">
													{teacher.salary.toLocaleString()} DT
												</TableCell>
												<TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm text-blue-600">
													{new Date(teacher.createdAt).toLocaleDateString()}
												</TableCell>
											</TableRow>
										</Link>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				</ComponentCard>
			</div>
		</>
	);
}
