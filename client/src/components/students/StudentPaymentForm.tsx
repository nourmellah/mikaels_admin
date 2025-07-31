// src/components/finance/PaymentForm.tsx
import { FormEvent } from 'react';
import { SliderWithInput } from '../form/SliderWithInput';

interface Props {
	courseCost: number;
	paidAmount: number;
	discount: number;
	amount: number;
	onChangeDiscount: (v: number) => void;
	onChangeAmount: (v: number) => void;
	onSubmit: (e: FormEvent) => void;
	onCancel: () => void;
}

export default function StudentPaymentForm({
	courseCost,
	paidAmount,
	discount,
	amount,
	onChangeDiscount,
	onChangeAmount,
	onSubmit,
	onCancel,
}: Props) {
	// compute maximum allowable amount based on discount
	const remaining = Math.max(0, courseCost - paidAmount);
	// max discount percent you can give so you don't exceed remaining
	const maxDiscountPct = courseCost > 0
		? Math.floor((remaining / courseCost) * 100)
		: 0;

	return (
		<form
			onSubmit={onSubmit}
			className="space-y-6 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
		>
			<h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
				Enregistrer un paiement
			</h4>

			{/* Discount slider */}
			<div>
				<label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
					Remise : <span className="font-medium">{discount}%</span>
				</label>
				<SliderWithInput
					label="Remise %"
					min={0}
					max={maxDiscountPct}
					value={discount}
					onChange={onChangeDiscount}
				/>
			</div>

			{/* Money slider */}
			<div>
				<label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
					Montant : <span className="font-medium">
						{amount.toFixed(3)} TND / {remaining.toFixed(3)} TND
					</span>

				</label>
				<SliderWithInput
					label="Montant"
					min={0}
					max={((remaining * (100 - discount) / 100))}
					step={1}
					value={amount}
					onChange={e => onChangeAmount(e)}
				/>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
				>
					Annuler
				</button>
				<button
					type="submit"
					className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
					disabled={amount <= 0}
				>
					Valider
				</button>
			</div>
		</form>
	);
}
