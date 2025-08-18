import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { SliderWithInput } from '../form/SliderWithInput';

type Props = {
  registrationId: string;
  agreedPrice: number;          // registration.agreed_price
  existingDiscount: number;     // registration.discount_amount (overall)
  totalPaidSoFar: number;       // sum of paid payments for this registration
  onSaved?: () => void;

  /** Required for wallet apply */
  studentId: string;
};

type DiscountMode = 'amount' | 'percent';

/** Round to 3 decimals for money display */
function round3(n: number) {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}

/** Clamp helper */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function StudentPaymentForm({
  registrationId,
  agreedPrice,
  existingDiscount,
  totalPaidSoFar,
  onSaved,
  studentId,
}: Props) {
  // ---------- Discount state ----------
  // Keep percentage UI; persist as amount on save
  const [discountMode] = useState<DiscountMode>('percent'); // reserved for future
  const [discountPct, setDiscountPct] = useState<number>(() => {
    const pct = agreedPrice > 0 ? (existingDiscount / agreedPrice) * 100 : 0;
    return clamp(pct, 0, 100);
  });

  // Compute discount amount from percentage
  const discountAmount = useMemo(() => {
    const amt = (agreedPrice * discountPct) / 100;
    return round3(clamp(amt, 0, agreedPrice));
  }, [agreedPrice, discountPct]);

  // ---------- Outstanding & payment ----------
  const outstandingBefore = useMemo(() => {
    // outstanding = agreed - discount - already paid
    const out = agreedPrice - discountAmount - totalPaidSoFar;
    return round3(Math.max(0, out));
  }, [agreedPrice, discountAmount, totalPaidSoFar]);

  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Clamp payment to outstanding
  const paymentClampedPreview = useMemo(
    () => round3(clamp(paymentAmount, 0, outstandingBefore)),
    [paymentAmount, outstandingBefore]
  );

  useEffect(() => {
    if (paymentAmount > outstandingBefore) {
      setPaymentAmount(outstandingBefore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outstandingBefore]);

  // ---------- Wallet (credit) ----------
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState<boolean>(false);

  // Fetch wallet balance (required to pay)
  useEffect(() => {
    let ignore = false;
    async function loadWallet() {
      setWalletLoading(true);
      setWalletError(null);
      setApiUnavailable(false);
      try {
        const res = await api.get(`/students/${studentId}/wallet`, { params: { limit: 1 } });
        if (!ignore) setWalletBalance(Number(res.data?.balance ?? 0));
      } catch (err: any) {
        // When wallet API is missing/unmounted, we must block payment (credit-only policy)
        if (!ignore) {
          setApiUnavailable(true);
          setWalletBalance(0);
        }
      } finally {
        if (!ignore) setWalletLoading(false);
      }
    }
    if (studentId) loadWallet();
    return () => { ignore = true; };
  }, [studentId]);

  // Convenience: set payment to max usable from wallet or outstanding
  function setMaxFromWallet() {
    const base = Math.min(walletBalance, outstandingBefore);
    if (base > 0) setPaymentAmount(round3(base));
  }

  // ---------- Submit (wallet required) ----------
  // 1) Update registration discount
  // 2) Apply credit via /students/:id/wallet/apply
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletError(null);

    const paymentToSave = paymentClampedPreview;

    // Basic validation
    if (apiUnavailable) {
      setWalletError("Le portefeuille est indisponible. Veuillez réessayer plus tard.");
      return;
    }
    if (walletLoading) {
      setWalletError("Le solde du portefeuille est en cours de chargement…");
      return;
    }
    if (!Number.isFinite(paymentToSave) || paymentToSave <= 0) {
      setWalletError('Montant invalide.');
      return;
    }
    if (walletBalance <= 0) {
      setWalletError("Aucun crédit disponible dans le portefeuille.");
      return;
    }
    if (paymentToSave > walletBalance) {
      setWalletError("Crédit insuffisant pour ce paiement.");
      return;
    }

    // Update registration discount first
    try {
      await api.put(`/registrations/${registrationId}`, {
        discountAmount,  // overall discount (amount)
        agreedPrice,     // keep server in sync if it expects it
      });
    } catch (err: any) {
      setWalletError(err?.response?.data?.message || "Échec de la mise à jour de la remise.");
      return;
    }

    // Apply wallet credit (single source of truth)
    try {
      // NOTE: the server should record the payment internally and set the correct date server-side.
      await api.post(`/students/${studentId}/wallet/apply`, {
        registrationId,
        amount: paymentToSave,
        note: 'Paiement via portefeuille',
        date: new Date().toISOString()
      });

      // Refresh wallet balance after applying
      try {
        const res = await api.get(`/students/${studentId}/wallet`, { params: { limit: 1 } });
        setWalletBalance(Number(res.data?.balance ?? 0));
      } catch {
      }
    } catch (err: any) {
      setWalletError(err?.response?.data?.message || "Échec d’application du crédit.");
      return;
    }

    // Reset local state and notify
    setPaymentAmount(0);
    if (onSaved) onSaved();
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
    >
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Enregistrer un paiement
      </h4>

      {/* Wallet credit banner (credit is mandatory) */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3.5">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-700 dark:text-gray-400">
            Crédit disponible (paiement uniquement via portefeuille)
          </div>
          <div className="text-lg font-semibold tabular-nums text-gray-900 dark:text-white">
            {walletLoading ? '…' : `${walletBalance.toFixed(3)} TND`}
          </div>
        </div>
        {apiUnavailable && (
          <p className="mt-2 text-xs text-amber-600">
            API Portefeuille indisponible pour le moment.
          </p>
        )}
      </div>

      {/* Outstanding helper */}
      <div className="text-xs text-gray-600 dark:text-gray-400">
        Montant restant à payer&nbsp;:{' '}
        <span className="font-medium text-gray-900 dark:text-white">
          {outstandingBefore.toFixed(3)} TND
        </span>
      </div>

      {/* Discount slider (percentage) */}
      <div>
        <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
          Remise&nbsp;: <span className="font-medium">{round3(discountPct)}%</span>{' '}
          <span className="text-gray-400">({discountAmount.toFixed(3)} TND)</span>
        </label>
        <SliderWithInput
          label="Remise %"
          min={0}
          max={100}
          value={discountPct}
          onChange={(v: number) => setDiscountPct(clamp(v, 0, 100))}
        />
      </div>

      {/* Payment amount slider */}
      <div>
        <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
          Montant du paiement&nbsp;:{' '}
          <span className="font-medium">{paymentClampedPreview.toFixed(3)} TND</span>
        </label>
        <SliderWithInput
          label="Montant"
          min={0}
          max={Math.max(0, outstandingBefore)}
          value={paymentAmount}
          step={1}
          onChange={(v: number) => setPaymentAmount(v)}
        />

        {/* Quick-fill from wallet */}
        <div className="mt-2">
          <button
            type="button"
            onClick={setMaxFromWallet}
            className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-950/30"
            title="Utiliser le maximum du portefeuille"
            disabled={apiUnavailable || walletBalance <= 0 || outstandingBefore <= 0}
          >
            Max portefeuille
          </button>
        </div>
      </div>

      {/* Inline errors */}
      {walletError && (
        <p className="text-sm text-rose-600">{walletError}</p>
      )}

      {/* Footer (single submit; wallet required) */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          disabled={
            apiUnavailable ||
            walletLoading ||
            paymentClampedPreview <= 0 ||
            walletBalance <= 0
          }
          title="Appliquer le crédit du portefeuille"
        >
          Appliquer le crédit
        </button>
      </div>
    </form>
  );
}
