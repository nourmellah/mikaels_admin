/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import InputField from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Label from '../../components/form/Label';
import ComponentCard from '../../components/common/ComponentCard';
import api from '../../api';
import { GroupDTO } from '../../models/Group';

export interface GroupPayload {
	name: string;
	level: string;
	weeklyHours: number;
	totalHours: number;
	price: number;
	teacherId: string | null;
}

interface Option { value: string; label: string; }

interface GroupFormProps {
	initialData?: GroupDTO;
	onSubmit: (data: GroupPayload) => Promise<void>;
	onCancel: () => void;
}

export default function GroupForm({ initialData, onSubmit, onCancel }: GroupFormProps) {
	const [name, setName] = useState(initialData?.name ?? '');
	const [level, setLevel] = useState(initialData?.level ?? '');
	const [weeklyHours, setWeeklyHours] = useState(initialData?.weeklyHours?.toString() ?? '');
	const [totalHours, setTotalHours] = useState(initialData?.totalHours?.toString() ?? '');
	const [price, setPrice] = useState(initialData?.price?.toString() ?? '');
	const [teacherId, setTeacherId] = useState(initialData?.teacherId ?? '');
	const [teachers, setTeachers] = useState<Option[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const levelOptions: Option[] = [
		{ value: 'A1', label: 'A1' },
		{ value: 'A2', label: 'A2' },
		{ value: 'B1', label: 'B1' },
		{ value: 'B2', label: 'B2' },
		{ value: 'C1', label: 'C1' },
		{ value: 'C2', label: 'C2' }
	];

	useEffect(() => {
		api.get('/teachers')
			.then(res => {
				const opts: Option[] = [{ value: '', label: 'Aucun professeur' }];
				res.data.forEach((t: any) =>
					opts.push({ value: String(t.id), label: `${t.firstName} ${t.lastName}` })
				);
				setTeachers(opts);
			})
			.catch(() => setTeachers([{ value: '', label: 'Aucun professeur' }]));
	}, []);

	// Auto-set price based on level
	useEffect(() => {
		if (level === 'B1' || level === 'B2') setPrice('800');
		else if (['A1', 'A2', 'C1', 'C2'].includes(level)) setPrice('600');
	}, [level]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Record<string, string> = {};
		if (!name) newErrors.name = 'Requis';
		if (!level) newErrors.level = 'Requis';
		if (!weeklyHours) newErrors.weeklyHours = 'Requis';
		if (!totalHours) newErrors.totalHours = 'Requis';
		if (!price) newErrors.price = 'Requis';
		if (Object.keys(newErrors).length) {
			setErrors(newErrors);
			return;
		}
		await onSubmit({
			name,
			level,
			weeklyHours: Number(weeklyHours),
			totalHours: Number(totalHours),
			price: Number(price),
			teacherId: teacherId || null
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<ComponentCard title={initialData ? 'Modifier un groupe' : 'Ajouter un groupe'}>
				<div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
					<div className="space-y-6">
						<ComponentCard title="Détails du groupe">
							<div>
								<Label>Nom du groupe</Label>
								<InputField value={name} onChange={e => setName(e.target.value)} />
								{errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
							</div>
							<div>
								<Label>Niveau</Label>
								<Select options={levelOptions} defaultValue={level} onChange={setLevel} />
								{errors.level && <p className="text-red-600 text-sm">{errors.level}</p>}
							</div>
							<div className="sm:col-span-2">
								<Label>Professeur</Label>
								<Select options={teachers} defaultValue={teacherId} onChange={setTeacherId} />
								{errors.teacherId && <p className="text-red-600 text-sm">{errors.teacherId}</p>}
							</div>
						</ComponentCard>
					</div>
					<div className="space-y-6">
						<ComponentCard title="Paramètres additionnels">
							<div>
								<Label>Heures hebdomadaires</Label>
								<InputField type="number" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)} />
								{errors.weeklyHours && <p className="text-red-600 text-sm">{errors.weeklyHours}</p>}
							</div>
							<div>
								<Label>Heures totales</Label>
								<InputField type="number" value={totalHours} onChange={e => setTotalHours(e.target.value)} />
								{errors.totalHours && <p className="text-red-600 text-sm">{errors.totalHours}</p>}
							</div>
							<div>
								<Label>Prix</Label>
								<InputField type="number" value={price} onChange={e => setPrice(e.target.value)} />
								{errors.price && <p className="text-red-600 text-sm">{errors.price}</p>}
							</div>
						</ComponentCard>
						<div className="flex items-center gap-3 px-2 mt-6 justify-end">
							<button type="button" onClick={onCancel} className="text-sm font-medium py-2.5 px-4 rounded-lg bg-white/[0.03] text-gray-400 hover:bg-white/[0.05]">Annuler</button>
							<button type="submit" className="text-sm font-medium py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700">{initialData ? 'Enregistrer' : 'Ajouter'}</button>
						</div>
					</div>
				</div>
			</ComponentCard>
		</form>
	);
}
