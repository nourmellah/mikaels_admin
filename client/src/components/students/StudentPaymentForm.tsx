// src/components/payments/StudentPaymentForm.tsx
import React from 'react';
import api from '../../api';
import { SliderWithInput } from '../form/SliderWithInput';

type Props = {
	registrationId: string;
	agreedPrice: number;          // registration.agreed_price
	existingDiscount: number;     // registration.discount_amount (overall)
	totalPaidSoFar: number;       // sum of paid payments for this registration
	onSaved?: () => void;
};

type DiscountMode = 'amount' | 'percent';

function round3(n: number) {
	return Math.max(0, Math.round(n * 1000) / 1000);
}
function clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n));
}
function pct(n: number) {
	return Math.round(n * 100) / 100;
}

export default function StudentPaymentForm({
	registrationId,
	agreedPrice,
	existingDiscount,
	totalPaidSoFar,
	onSaved
}: Props) {
	// The discount is the **overall** discount to store on the registration.
	// Initialize to the existing saved discount.
	const [discountMode, setDiscountMode] = React.useState<DiscountMode>('amount');
	const [discountInput, setDiscountInput] = React.useState<string>(String(existingDiscount ?? 0));
	const [paymentInput, setPaymentInput] = React.useState<string>(''); // amount for this new payment

	// Derived numbers (live)
	const price = Number(agreedPrice) || 0;
	const paid = Number(totalPaidSoFar) || 0;

	// Max discount amount is what’s left unpaid right now.
	const maxDiscountAmount = React.useMemo(() => round3(Math.max(0, price - paid)), [price, paid]);
	const maxDiscountPercent = price > 0 ? round3((maxDiscountAmount / price) * 100) : 0;

	// Compute the **overall** discount amount based on mode + input, then clamp to allowed max
	const rawDiscount = React.useMemo(() => {
		const val = Number(discountInput) || 0;
		if (discountMode === 'percent') {
			return round3((price * val) / 100);
		}
		return round3(val);
	}, [discountInput, discountMode, price]);

	const discountAmount = clamp(rawDiscount, 0, maxDiscountAmount);
	const discountPercent = price > 0 ? round3((discountAmount / price) * 100) : 0;

	// Outstanding before the new payment
	const outstanding = React.useMemo(
		() => round3(Math.max(0, price - discountAmount - paid)),
		[price, discountAmount, paid]
	);

	// Max payment is exactly the outstanding (cannot overpay)
	const maxPayment = outstanding;

	// Live clamp the payment input display (we only clamp on submit, but show helper)
	const paymentVal = Number(paymentInput) || 0;
	const paymentClampedPreview = clamp(round3(paymentVal), 0, maxPayment);

	/* Helper text at the top (live-updating)
		const topText = React.useMemo(() => {
			const paidPct = price > 0 ? pct((paid / price) * 100) : 0;
			const discPct = price > 0 ? pct((discountAmount / price) * 100) : 0;
			return [
				`Prix: ${price.toFixed(3)} TND`,
				`Payé: ${round3(paid).toFixed(3)} TND (${paidPct}%)`,
				`Remise: ${round3(discountAmount).toFixed(3)} TND (${discPct}%)`,
				`Reste: ${outstanding.toFixed(3)} TND`,
				`Remise max possible: ${maxDiscountAmount.toFixed(3)} TND (${maxDiscountPercent}%)`,
				`Paiement max: ${maxPayment.toFixed(3)} TND`,
			].join(' • ');
		}, [price, paid, discountAmount, outstanding, maxDiscountAmount, maxDiscountPercent]);*/

	// Handlers
	const onChangeDiscountMode = (m: DiscountMode) => setDiscountMode(m);
	const onChangeDiscountInput = (v: string) => setDiscountInput(v.replace(',', '.'));
	const onChangePaymentInput = (v: string) => setPaymentInput(v.replace(',', '.'));
	
	// Submit:
	// 1) Patch registration with the **overall** discountAmount (clamped)
	// 2) If payment > 0, post the payment with amount = clamped value
	const handleSave = async () => {
		const discountToSave = discountAmount;
		const paymentToSave = paymentClampedPreview;

		const today = new Date().toISOString();

		try {
			// Update registration’s overall discount (not per-payment)
			await api.put(`/registrations/${registrationId}`, {
				discountAmount: discountToSave,
				agreedPrice: maxPayment,
			});

			// Then save payment if any
			if (paymentToSave > 0) {
				await api.post('/payments', {
					registrationId,
					amount: paymentToSave,
					discount: discountToSave,
					date: today,
				});
			}

			onSaved?.();
		} catch (e) {
			// handle UI error as you prefer
			console.error(e);
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSave?.(); // keep your existing save logic
			}}
			className="space-y-6 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
		>
			<h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
				Enregistrer un paiement
			</h4>

			{/* Discount mode toggle */}
			<div className="flex items-center justify-between">
				<span className="text-xs text-gray-500 dark:text-gray-400">Mode de remise</span>
				<label className="inline-flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={discountMode === 'percent'}
						onChange={(e) => setDiscountMode(e.target.checked ? 'percent' : 'amount')}
					/>
					<span>{discountMode === 'percent' ? 'Pourcentage (%)' : 'Montant (TND)'}</span>
				</label>
			</div>

			{/* Discount slider */}
			<div>
				<label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
					Remise :{' '}
					<span className="font-medium">
						{discountMode === 'percent'
							? `${discountPercent}% (${discountAmount.toFixed(3)} TND)`
							: `${discountAmount.toFixed(3)} TND (${discountPercent}%)`}
					</span>
				</label>
				<SliderWithInput
					label={discountMode === 'percent' ? 'Remise %' : 'Remise (TND)'}
					min={0}
					max={discountMode === 'percent' ? 100 : maxDiscountAmount}
					step={1}
					value={discountMode === 'percent' ? discountPercent : discountAmount}
					onChange={(v) => onChangeDiscountInput(String(v))}
				/>
			</div>

			{/* Money slider */}
			<div>
				<label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
					Montant :{' '}
					<span className="font-medium">
						{paymentClampedPreview.toFixed(3)} TND / {outstanding.toFixed(3)} TND
					</span>
				</label>
				<SliderWithInput
					label="Montant"
					min={0}
					max={maxPayment}
					step={1}
					value={paymentClampedPreview}
					onChange={(v) => onChangePaymentInput(String(v))}
				/>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={() => onSaved?.()}
					className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
				>
					Annuler
				</button>
				<button
					type="submit"
					className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
					disabled={paymentClampedPreview <= 0}
				>
					Valider
				</button>
			</div>
		</form>
	);

}

