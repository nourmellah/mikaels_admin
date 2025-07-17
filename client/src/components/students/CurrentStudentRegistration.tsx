/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Modal } from '../ui/modal';
import GroupCostBar from '../ecommerce/SegmentedBar';
import { RegistrationDTO } from '../../models/Registration';
import { PaymentDTO } from '../../models/Payment';
import { GroupDTO } from '../../models/Group';

interface Props {
	studentId: string;
	currentGroupId: string | null;
}

export default function CurrentStudentRegistration({ studentId, currentGroupId }: Props) {
	const [registration, setRegistration] = useState<RegistrationDTO | null>(null);
	const [group, setGroup] = useState<GroupDTO | null>(null);
	const [payments, setPayments] = useState<PaymentDTO[]>([]);
	const [paidAmount, setPaidAmount] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [payAmount, setPayAmount] = useState('');

	useEffect(() => {
		async function fetchData() {
			if (!studentId || !currentGroupId) return;
			const regsRes = await api.get<RegistrationDTO[]>('/registrations');
			const regs = regsRes.data.filter(
				r => r.studentId === studentId && r.groupId === currentGroupId
			);
			if (!regs.length) return;
			const reg = regs[regs.length - 1];
			setRegistration(reg);
			const grpRes = await api.get<GroupDTO>(`/groups/${currentGroupId}`);
			setGroup(grpRes.data);
			const payRes = await api.get<PaymentDTO[]>(`/payments/registration/${reg.id}`);
			setPayments(payRes.data);
			setPaidAmount(payRes.data.reduce((sum, p) => sum + Number(p.amount), 0));
		}
		fetchData();
	}, [studentId, currentGroupId]);

	if (!registration || !group) return null;

	const { agreedPrice } = registration;
	const paidPct = agreedPrice > 0 ? (paidAmount / agreedPrice) * 100 : 0;

	let weeksRunning = 0;
	let isHalfway = false;
	if (group.startDate && group.endDate) {
		const start = new Date(group.startDate);
		const end = new Date(group.endDate);
		const now = new Date();
		const elapsed = Math.max(0, now.getTime() - start.getTime());
		const duration = end.getTime() - start.getTime() + 1;
		weeksRunning = Math.ceil(elapsed / (1000 * 60 * 60 * 24 * 7));
		isHalfway = elapsed > duration / 2;
	}

	const runningBehind =
		(group.startDate && paidAmount === 0) ||
		(isHalfway && paidPct < 50);

	const handlePay = async (e: React.FormEvent) => {
		e.preventDefault();
		const amt = parseFloat(payAmount);
		if (isNaN(amt) || amt <= 0 || !registration) return;
		const today = new Date().toISOString().split('T')[0];
		await api.post('/payments', {
			registrationId: registration.id,
			amount: amt,
			date: today,
			isPaid: true,
		});
		setShowModal(false);
		setPayAmount('');
		const payRes = await api.get<PaymentDTO[]>(`/payments/registration/${registration.id}`);
		setPayments(payRes.data);
		setPaidAmount(payRes.data.reduce((sum, p) => sum + p.amount, 0));
	};

	return (
		<div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
						Inscription actuelle
					</h4>
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
						<div>
							<p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
								Groupe
							</p>
							<p className="text-sm font-medium text-gray-800 dark:text-white/90">
								{group.name}
							</p>
						</div>
						{group.startDate && (
							<div>
								<p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
									Début
								</p>
								<p className="text-sm font-medium text-gray-800 dark:text-white/90">
									{group.startDate.split('T')[0]}
								</p>
							</div>
						)}
						{group.startDate && (
							<div>
								<p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
									Durée estimée
								</p>
								<p className="text-sm font-medium text-gray-800 dark:text-white/90">
									Environ {weeksRunning} semaine{weeksRunning > 1 ? 's' : ''}
								</p>
							</div>
						)}
						<div className="lg:col-span-2">
							<p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
								Paiement
							</p>
							<GroupCostBar
								blue={paidAmount}
								yellow={0}
								red={agreedPrice - paidAmount}
								green={0}
							/>
							<p className="mt-2 text-sm font-medium text-gray-800 dark:text-white/90">
								Payé: {paidAmount} TND ({paidPct.toFixed(0)}%)
							</p>
							{runningBehind && (
								<p className="mt-2 text-red-600 font-medium">
									L'étudiant est en retard sur les paiements
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="flex lg:block">
					<button
						onClick={() => setShowModal(true)}
						className="w-full lg:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
					>
						Payer
					</button>
				</div>
			</div>

			{showModal && (
				<Modal isOpen onClose={() => setShowModal(false)} className='max-w-[700px]'>
					<form onSubmit={handlePay} className="space-y-4 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
						<h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
							Enregistrer un paiement
						</h4>
						<div>
							<label className="mb-2 block text-xs text-gray-500 dark:text-gray-400">
								Montant TND
							</label>
							<input
								type="number"
								value={payAmount}
								onChange={e => setPayAmount(e.target.value)}
								className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
							/>
						</div>
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setShowModal(false)}
								className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
							>
								Annuler
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
							>
								Valider
							</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}
