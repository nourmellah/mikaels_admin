import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { Modal } from "../ui/modal"; 

type WalletTxn = {
  id: string;
  amount: number; // + pour dépôts, - pour application
  kind: "DEPOSIT" | "APPLY_TO_REGISTRATION" | "REFUND" | "ADJUSTMENT";
  related_registration_id?: string | null;
  note?: string | null;
  created_at: string; // ISO
};

type WalletPayload = {
  balance: number;
  transactions: WalletTxn[];
};

type Props = {
  studentId: string;
  className?: string;
	refreshKey?: number;
};

function currency(n: number | undefined | null) {
  if (n == null || Number.isNaN(n)) return "0.000";
  return Number(n).toFixed(3);
}

/* --- Styles alignés sur CurrentStudentRegistration (thème bleu) --- */
const BTN_PRIMARY =
  "inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-medium " +
  "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-700 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 " +
  "disabled:opacity-60 disabled:pointer-events-none";

const BTN_OUTLINE =
  "inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-medium " +
  "border border-blue-600 text-blue-600 hover:bg-blue-50 " +
  "dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-950/30 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 " +
  "disabled:opacity-60 disabled:pointer-events-none";

const INPUT_BASE =
  "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-black/20 " +
  "px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-600";

export default function StudentWalletCard({ studentId, className, refreshKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletPayload | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const [depositOpen, setDepositOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const balance = wallet?.balance ?? 0;

  async function loadWallet() {
    if (!studentId) return;
    setLoading(true);
    setApiUnavailable(false);
    try {
      const res = await api.get(`/students/${studentId}/wallet`, { params: { limit: 20 } });
      const data = res.data as WalletPayload;
      setWallet({
        balance: Number(data?.balance ?? 0),
        transactions: Array.isArray(data?.transactions) ? data.transactions : [],
      });
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setApiUnavailable(true);
        setWallet({ balance: 0, transactions: [] });
      } else {
        console.error("Wallet load error:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWallet();
  }, [studentId, refreshKey]);

  return (
    <div
      className={[
        "space-y-8 p-7 lg:p-8 border border-gray-200 dark:border-gray-800 rounded-2xl",
        className ?? "",
      ].join(" ")}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Portefeuille</h4>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Suivi des crédits prépayés et de leur utilisation
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-700 dark:text-gray-400">Solde</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
            {currency(balance)} TND
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={BTN_PRIMARY}
          onClick={() => setDepositOpen(true)}
          disabled={apiUnavailable || loading}
          title={apiUnavailable ? "API Portefeuille indisponible pour le moment" : "Ajouter du crédit"}
        >
          Ajouter du crédit
        </button>

        <button
          type="button"
          className={BTN_OUTLINE}
          onClick={() => setHistoryOpen(true)}
          disabled={apiUnavailable || loading}
          title={apiUnavailable ? "API Portefeuille indisponible pour le moment" : "Voir l’historique"}
        >
          Voir l’historique
        </button>

        {apiUnavailable && (
          <span className="ml-auto text-xs text-amber-600">
            API Portefeuille indisponible pour le moment
          </span>
        )}
      </div>

      {/* Pied de carte */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={loadWallet}
          disabled={loading}
          className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 focus-visible:outline-none"
        >
          Actualiser
        </button>
        {loading && <span className="text-xs text-gray-600 dark:text-gray-400">Chargement…</span>}
      </div>

      {/* Modal Dépôt */}
      {depositOpen && (
        <Modal onClose={() => setDepositOpen(false)} isOpen={true} className="max-w-[700px]">
          <div className="space-y-7 p-6 lg:p-7 rounded-2xl">
            <div className="space-y-1">
              <h5 className="text-base font-semibold text-gray-900 dark:text-white">Ajouter du crédit</h5>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Créer un dépôt dans le portefeuille de l’étudiant.
              </p>
            </div>

            <DepositForm
              studentId={studentId}
              onCancel={() => setDepositOpen(false)}
              onSaved={async () => {
                setDepositOpen(false);
                await loadWallet();
              }}
            />
          </div>
        </Modal>
      )}

      {/* Modal Historique */}
      {historyOpen && (
        <Modal onClose={() => setHistoryOpen(false)} isOpen={true} className="max-w-[700px]">
          <div className="space-y-6 p-6 lg:p-7 rounded-2xl">
            <div className="space-y-1">
              <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                Historique du portefeuille
              </h5>
              <p className="text-sm text-gray-700 dark:text-gray-400">Dernières transactions</p>
            </div>

            <HistoryList transactions={wallet?.transactions ?? []} />

            <div className="flex justify-end">
              <button type="button" className={BTN_OUTLINE} onClick={() => setHistoryOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* -------------------------- Formulaire de dépôt -------------------------- */

function DepositForm({
  studentId,
  onCancel,
  onSaved,
}: {
  studentId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) && n > 0;
  }, [amount]);

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await api.post(`/students/${studentId}/wallet/deposit`, {
        amount: Number(amount),
        note: note || undefined,
      });
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Échec du dépôt";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <div>
          <label className="block text-xs text-gray-700 dark:text-gray-400 mb-1.5">
            Montant (TND)
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={INPUT_BASE}
            placeholder="0.000"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-700 dark:text-gray-400 mb-1.5">
            Remarque (optionnel)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={INPUT_BASE}
            placeholder="ex.: Dépôt en espèces"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" className={BTN_OUTLINE} onClick={onCancel} disabled={submitting}>
          Annuler
        </button>
        <button
          type="button"
          className={BTN_PRIMARY}
          onClick={submit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? "Enregistrement…" : "Ajouter du crédit"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------- Liste des transactions ----------------------- */

function HistoryList({ transactions }: { transactions: WalletTxn[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
      {transactions.length === 0 && (
        <div className="p-4 text-sm text-gray-700 dark:text-gray-400">
          Aucune transaction pour le moment.
        </div>
      )}

      {transactions.map((t) => (
        <div key={t.id} className="p-4 flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-xs text-gray-700 dark:text-gray-400">
              {new Date(t.created_at).toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {labelKind(t.kind)}
              {t.related_registration_id ? (
                <span className="text-gray-700 dark:text-gray-400">
                  {" "}
                  · Inscr.: {t.related_registration_id.slice(0, 8)}…
                </span>
              ) : null}
            </div>
            {t.note && (
              <div className="text-sm text-gray-800 dark:text-gray-300">{t.note}</div>
            )}
          </div>
          <div
            className={[
              "text-sm font-semibold tabular-nums",
              t.amount >= 0 ? "text-emerald-600" : "text-rose-600",
            ].join(" ")}
          >
            {t.amount >= 0 ? "+" : ""}
            {currency(t.amount)} TND
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- Libellés -------------------------------- */

function labelKind(kind: WalletTxn["kind"]) {
  switch (kind) {
    case "DEPOSIT":
      return "Dépôt";
    case "APPLY_TO_REGISTRATION":
      return "Appliqué à l’inscription";
    case "REFUND":
      return "Remboursement";
    case "ADJUSTMENT":
      return "Ajustement";
    default:
      return kind;
  }
}
