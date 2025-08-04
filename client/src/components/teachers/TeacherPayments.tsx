import { useState, useEffect, FormEvent } from 'react';
import api from '../../api';
import ComponentCard from '../common/ComponentCard';
import { Modal } from '../ui/modal';
import { SliderWithInput } from '../form/SliderWithInput';
import DatePicker from '../form/date-picker';
import Button from '../ui/button/Button';

interface TeacherDues {
	group_id: string;
	group_name: string;
	total_hours: number;
	rate: number;
	amount_due: number;
	unpaid_amount: number;
}

interface TeacherPayment {
	id: string;
	teacher_id: string;
	group_id: string;
	total_hours: number;
	rate: number;
	amount: number;
	paid: boolean;
	paid_date: string;
}

interface Props {
	teacherId: string;
}

export default function TeacherPayments({ teacherId }: Props) {
	const [dues, setDues] = useState<TeacherDues[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState<TeacherDues | null>(null);
	const [payments, setPayments] = useState<TeacherPayment[]>([]);
	const [amount, setAmount] = useState<number>(0);
	const [paidDate, setPaidDate] = useState<string>(new Date().toISOString().slice(0, 10));
	const [paid, setPaid] = useState<boolean>(true);

	useEffect(() => {
		api.get<TeacherDues[]>(`/teacher-payments/summary?teacher_id=${teacherId}`)
			.then(res => setDues(res.data))
	}, [dues, teacherId]);

	const openModal = async (group: TeacherDues) => {
		setSelectedGroup(group);
		const res = await api.get<TeacherPayment[]>(
			`/teacher-payments?teacher_id=${teacherId}&group_id=${group.group_id}`
		);
		setPayments(res.data);
		setAmount(0);
		setPaid(true);
		setPaidDate(new Date().toISOString().slice(0, 10));
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setSelectedGroup(null);
	};

	const reloadData = async () => {
		if (!selectedGroup) return;
		const payRes = await api.get<TeacherPayment[]>(
			`/teacher-payments?teacher_id=${teacherId}&group_id=${selectedGroup.group_id}`
		);
		setPayments(payRes.data);
		const duesRes = await api.get<TeacherDues[]>(`/teacher-payments/summary?teacher_id=${teacherId}`);
		setDues(duesRes.data);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!selectedGroup) return;
		await api.post('/teacher-payments', {
			teacher_id: teacherId,
			group_id: selectedGroup.group_id,
			total_hours: selectedGroup.total_hours,
			rate: selectedGroup.rate,
			amount,
			paid,
			paid_date: paidDate,
		});
		await reloadData();
	};

	return (
		<ComponentCard title="Paiements Enseignant">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{dues.map(d => (
					<div key={d.group_id} className="flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
						<div className="flex justify-between mb-2">
							<h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{d.group_name}</h4>
							<span className="text-xs text-gray-500 dark:text-gray-400">{d.total_hours} h</span>
						</div>
						<div className="mt-auto">
							<p className="text-base text-gray-800 dark:text-gray-200">
								<span className="font-bold">{d.amount_due - d.unpaid_amount} TND</span> /
								<span className="font-bold">{d.amount_due} TND</span>
							</p>
						</div>
						<div className="mt-4 flex justify-end">
							<Button size="sm" onClick={() => openModal(d)}>Gérer</Button>
						</div>
					</div>
				))}
				{dues.length === 0 && (
					<p className="col-span-full text-center text-gray-500 dark:text-gray-400">Aucun paiement dû.</p>
				)}
			</div>

			{showModal && selectedGroup && (
				<Modal isOpen onClose={closeModal} className="max-w-[1000px]">
					<div className="mx-auto">
						<form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
							<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
								Paiements - {selectedGroup.group_name}
							</h3>

							<section className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Historique</label>
								<ul className="max-h-40 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
									{payments.map(p => (
										<li key={p.id} className="py-2 flex justify-between text-sm text-gray-800 dark:text-gray-200">
											<span>{p.paid_date}</span>
											<span>{p.amount} TND</span>
										</li>
									))}
									{payments.length === 0 && <li className="py-2 text-center text-gray-500 dark:text-gray-400">Aucun paiement</li>}
								</ul>
							</section>

							<section className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant (TND)</label>
								<SliderWithInput
									min={0} max={selectedGroup.amount_due} step={1}
									value={amount} onChange={setAmount} label={'Montant (TND)'} />
							</section>

							<section className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de paiement</label>
								<DatePicker
									id="teacher-payment-date"
									defaultDate={new Date(paidDate)}
									onChange={(dates: Date[]) => {
										if (dates && dates[0]) setPaidDate(dates[0].toISOString().slice(0, 10));
									}}
								/>
							</section>
							<div className="flex justify-end space-x-2 pt-4">
								<Button variant="outline" onClick={closeModal}>Annuler</Button>
								<Button type="submit" disabled={amount <= 0}>Valider</Button>
							</div>
						</form>
					</div>
				</Modal>
			)}
		</ComponentCard>
	);
}
