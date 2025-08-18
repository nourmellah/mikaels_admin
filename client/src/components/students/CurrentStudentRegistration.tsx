/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Modal } from '../ui/modal';
import SegmentedBar from '../ecommerce/SegmentedBar';
import { RegistrationDTO } from '../../models/Registration';
import { PaymentDTO } from '../../models/Payment';
import { GroupDTO } from '../../models/Group';
import StudentPaymentForm from './StudentPaymentForm';
import { StudentPaymentSummaryDTO } from '../../models/StudentPaymentSummary';

interface Props {
	studentId: string;
	currentGroupId: string | null;
	onUpdate?: () => void;
}

export default function CurrentStudentRegistration({ studentId, currentGroupId, onUpdate }: Props) {
	const [registration, setRegistration] = useState<RegistrationDTO | null>(null);
	const [group, setGroup] = useState<GroupDTO | null>(null);
	const [payments, setPayments] = useState<PaymentDTO[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [discount, setDiscount] = useState<number>(0);
	const [payAmount, setPayAmount] = useState<string>('0');
	const [paidAmount, setPaidAmount] = useState<number>(0);
	const [outstandingAmount, setOutstandingAmount] = useState<number>(0);

	const loadSummary = React.useCallback(async () => {
		if (!studentId || !currentGroupId) return;
		const sumRes = await api.get<StudentPaymentSummaryDTO>(
			`/registrations/summary?student_id=${studentId}&group_id=${currentGroupId}`
		);
		setPaidAmount(sumRes.data.totalPaid);
		setOutstandingAmount(sumRes.data.outstandingAmount);
	}, [studentId, currentGroupId]);

	useEffect(() => {
		async function fetchData() {
			if (!studentId || !currentGroupId) return;

			// fetch the registration itself
			const regRes = await api.get<RegistrationDTO[]>(
				`/registrations?student_id=${studentId}&group_id=${currentGroupId}`
			);
			const reg = regRes.data[0];
			if (!reg) return;
			setRegistration(reg);

			// fetch the group
			const grpRes = await api.get<GroupDTO>(
				`/groups/${currentGroupId}`
			);
			setGroup(grpRes.data);
			setDiscount(reg.discountAmount || 0);

			// fetch the summary (total_paid & outstanding_amount)
			await loadSummary();
		}

		fetchData();
	}, [studentId, currentGroupId, paidAmount, outstandingAmount, loadSummary]);

	if (!registration || !group) return null;

	const netPrice = registration.agreedPrice;
	const paidPct = netPrice > 0
		? (paidAmount / netPrice) * 100
		: 0;

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
		await api.put(`/registrations/${registration.id}`, {
			agreedPrice: group.price * (100 - discount) / 100,
			discountAmount: discount,
		});
		setShowModal(false);
		setPayAmount('');
		const payRes = await api.get<PaymentDTO[]>(
			`/payments?registration_id=${registration.id}`
		);
		setPayments(payRes.data);
		setPaidAmount(
			payRes.data.reduce((sum, p) => sum + Number(p.amount), 0)
		);
		loadSummary();
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
						<div className="lg:col-span-4">
							<p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
								Paiement
							</p>
							<SegmentedBar
								segments={[
									{ value: paidAmount, label: 'Payé', color: '#3182ce' },
									{ value: outstandingAmount, label: 'Restant', color: '#e53e3e' },
									{ value: discount, label: 'Remise', color: '#48bb78' },
								]}
								showLabels
								showValues
								height='h-16'
							/>
							<p className="mt-2 text-sm font-medium text-gray-800 dark:text-white/90">
								Payé: {paidAmount} TND ({paidPct.toFixed(2)}%) — Remisé: {group.price - netPrice} TND
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
				<Modal isOpen onClose={() => setShowModal(false)} className="max-w-[700px]">
					<StudentPaymentForm
						studentId={studentId}
						registrationId={registration.id ?? ''}
						agreedPrice={netPrice}
						existingDiscount={discount}
						totalPaidSoFar={paidAmount}
						onSaved={() => {
							setShowModal(false);
							loadSummary();
							onUpdate?.();
							console.log("Wallet updated");
						}}
					/>
				</Modal>
			)}
		</div>
	);
}
