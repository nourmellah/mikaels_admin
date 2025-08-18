import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../api';
import GroupForm from './GroupForm';
import { Modal } from '../ui/modal';
import { GroupDTO } from '../../models/Group';
import { useNavigate } from 'react-router';

// ===================== Types =====================
export interface StudentLite {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  groupId?: string | null;
}

export interface GroupLite {
  id: string;
  name: string;
  level?: string | null;
  startDate?: string | null; // ISO
  endDate?: string | null;   // ISO
  scheduleText?: string | null;
}

// from VIEW: group_cost_summary
export interface GroupSummary {
  group_id?: string | number | null;
  group_name?: string | null;
  teacher_name?: string | null; // if API adds it later

  total_hours?: string | number | null;
  rate?: string | number | null;
  teacher_amount_due?: string | number | null;
  teacher_paid?: string | number | null;
  teacher_unpaid?: string | number | null;

  group_total_cost?: string | number | null;
  group_paid_cost?: string | number | null;
  group_unpaid_cost?: string | number | null;

  general_paid?: string | number | null;
  general_unpaid?: string | number | null;
  total_outstanding?: string | number | null;
}

// from VIEW: student_payments_per_group (returned as the *first* element for a given student/group)
export interface RegistrationSummary {
  registrationId?: string | number | null;
  studentId?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
  groupId?: string | number | null;
  groupName?: string | null;
  agreedPrice?: string | number | null;
  depositPct?: string | number | null;
  discountAmount?: string | number | null;
  totalPaid?: string | number | null;
  outstandingAmount?: string | number | null;
}

export type ExpandedGroupCardProps = {
  group: GroupLite;
  teacherName?: string | null; // libellé enseignant passé par le parent (comme l'ancien GroupCard)
  fetchSummary?: boolean; // la carte charge son propre résumé
  currency?: string; // ex: 'TND'
  className?: string;
  onUpdated?: (updated: GroupDTO) => void; // notifie la liste parente
  onProfitReady?: (profit: number | null) => void;
};

// ===================== Helpers =====================
const fmtMoney = (v: number | undefined | null, currency = 'TND') => {
  if (v == null || Number.isNaN(v)) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
      Number(Number(v).toFixed(2))
    );
  } catch {
    return `${Number(Number(v).toFixed(2))} ${currency}`;
  }
};

// robust parsing: accepts numbers or numeric strings with spaces/commas/symbols
const sanitizeNumeric = (val: any): number | undefined => {
  if (val == null) return undefined;
  if (typeof val === 'number') return Number.isFinite(val) ? val : undefined;
  const str = String(val).trim();
  let s = str.replace(/\s+/g, '').replace(/,/g, '.');
  s = s.replace(/[^0-9+\-\.Ee]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};
const n = (v: any) => sanitizeNumeric(v);
const n0 = (v: any) => sanitizeNumeric(v) ?? 0;

const studentLabel = (s: StudentLite) =>
  s?.name?.trim() || [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim() || 'Élève';

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
      <div className="h-full bg-gray-900 dark:bg-white transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ===================== Component =====================
export default function ExpandedGroupCard({
  group,
  teacherName,
  fetchSummary = true,
  currency = 'TND',
  className,
  onUpdated,
  onProfitReady
}: ExpandedGroupCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Summary (costs)
  const [summary, setSummary] = useState<GroupSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Students basic list
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Per-student registration/payment summary
  const [regSummaries, setRegSummaries] = useState<Record<string, RegistrationSummary | null>>({});
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [regsError, setRegsError] = useState<string | null>(null);

  const navigate = useNavigate()

  // -------- Fetch group summary (costs) --------
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!fetchSummary || !group?.id) return;
      setLoadingSummary(true);
      setSummaryError(null);
      try {
        const res = await api.get(`/groups/${group.id}/summary`);
        if (!cancelled) setSummary(res?.data ?? null);
      } catch (e: any) {
        if (!cancelled) setSummaryError(e?.message || 'Échec du chargement du résumé');
      } finally {
        if (!cancelled) setLoadingSummary(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [fetchSummary, group?.id, refreshKey]);

  // -------- Fetch students (then filter by group) --------
  useEffect(() => {
    let cancelled = false;
    async function loadStudents() {
      if (!group?.id) return;
      setLoadingStudents(true);
      setStudentsError(null);
      try {
        const res = await api.get('/students');
        if (cancelled) return;
        const list: StudentLite[] = Array.isArray(res?.data) ? res.data : [];
        const filtered = list.filter((s: any) => String(s?.groupId ?? '') === String(group.id));
        setStudents(filtered);
      } catch (e: any) {
        if (!cancelled) setStudentsError(e?.message || 'Échec du chargement des élèves');
      } finally {
        if (!cancelled) setLoadingStudents(false);
      }
    }
    loadStudents();
    return () => {
      cancelled = true;
    };
  }, [group?.id, refreshKey]);

  // -------- Fetch per-student registration summary (payments) --------
  useEffect(() => {
    let cancelled = false;
    async function loadRegs() {
      if (!group?.id || students.length === 0) {
        setRegSummaries({});
        return;
      }
      setLoadingRegs(true);
      setRegsError(null);
      try {
        const results = await Promise.all(
          students.map(async (s) => {
            try {
              const res = await api.get('/registrations/summary', {
                params: { student_id: s.id, group_id: group.id },
              });
              return [s.id, res?.data ?? null] as const;
            } catch (e) {
              return [s.id, null] as const;
            }
          })
        );
        if (cancelled) return;
        console.log(results);
        const map: Record<string, RegistrationSummary | null> = {};
        results.forEach(([sid, item]) => { map[sid] = item; });
        setRegSummaries(map);
      } catch (e: any) {
        if (!cancelled) setRegsError(e?.message || 'Échec du chargement des paiements');
      } finally {
        if (!cancelled) setLoadingRegs(false);
      }
    }
    loadRegs();
    return () => { cancelled = true; };
  }, [group?.id, students, refreshKey]);

  const onCardClick = () => navigate(`/groups/${group.id}`);

  // -------- Derived values --------
  const studentCount = students.length;
  const topStudents = useMemo(() => students.slice(0, 5), [students]);

  const teacherLabel = useMemo(
    () => teacherName ?? summary?.teacher_name ?? null,
    [teacherName, summary?.teacher_name]
  );

  const metrics = useMemo(() => {
    // Payments from registration summaries
    const perReg = students.map((s) => regSummaries[s.id] ?? null);

    const expectedFromReg = (r?: RegistrationSummary | null) => {
      const agreed = n(r?.agreedPrice) ?? 0;
      const discount = n0(r?.discountAmount);
      return Math.max(0, agreed - discount);
    };
    const paidFromReg = (r?: RegistrationSummary | null) => n0(r?.totalPaid);
    const outstandingFromReg = (r?: RegistrationSummary | null) => {
      const v = n(r?.outstandingAmount);
      if (v !== undefined) return Math.max(0, v);
      return Math.max(0, expectedFromReg(r) - paidFromReg(r));
    };
    const statusFromReg = (r?: RegistrationSummary | null): 'PAID' | 'PARTIAL' | 'DUE' => {
      const exp = expectedFromReg(r);
      const paid = paidFromReg(r);
      const out = outstandingFromReg(r);
      if (exp <= 0) return 'DUE';
      if (out <= 1e-6) return 'PAID';
      if (paid > 0) return 'PARTIAL';
      return 'DUE';
    };

    const revenueDue = perReg.reduce((sum, r) => sum + expectedFromReg(r), 0);
    const revenueCollected = perReg.reduce((sum, r) => sum + paidFromReg(r), 0);
    const revenueOutstanding = perReg.reduce((sum, r) => sum + outstandingFromReg(r), 0);

    const paidStudentsCount = perReg.filter((r) => statusFromReg(r) === 'PAID').length;
    const unpaidStudentsCount = perReg.length - paidStudentsCount;

    // Costs from group summary view
    const teacherDue = n0(summary?.teacher_amount_due);
    const teacherPaid = n0(summary?.teacher_paid);
    const teacherUnpaid = n0(summary?.teacher_unpaid);

    const groupTotal = n0(summary?.group_total_cost);
    const groupPaid = n0(summary?.group_paid_cost);
    const groupUnpaid = n0(summary?.group_unpaid_cost);

    const generalPaid = n0(summary?.general_paid);
    const generalUnpaid = n0(summary?.general_unpaid);

    const totalCostsPaid = teacherPaid + groupPaid + generalPaid;
    const totalCostsUnpaid = teacherUnpaid + groupUnpaid + generalUnpaid;
    const totalCosts = totalCostsPaid + totalCostsUnpaid;

    const totalOutstanding = n(summary?.total_outstanding);

    const profit = revenueCollected - totalCosts;

    return {
      // students
      paidStudentsCount,
      unpaidStudentsCount,
      revenueDue,
      revenueCollected,
      revenueOutstanding,
      // costs
      teacherDue,
      teacherPaid,
      teacherUnpaid,
      groupTotal,
      groupPaid,
      groupUnpaid,
      generalPaid,
      generalUnpaid,
      totalCosts,
      totalCostsPaid,
      totalCostsUnpaid,
      totalOutstanding,
      // result
      profit,
    };
  }, [students, regSummaries, summary]);

  const anyLoading = loadingSummary || loadingStudents || loadingRegs;
  const anyError = summaryError || studentsError || regsError;

  const profitSignClass = metrics.profit == null
    ? ''
    : metrics.profit >= 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400';

  const rawProfit = (metrics as any)?.profit;

  const profit = useMemo(() => {
    if (typeof rawProfit === "number" && Number.isFinite(rawProfit)) return rawProfit;
    if (typeof rawProfit === "string") {
      const n = parseFloat(rawProfit);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }, [rawProfit]);

  const orderValue = profit == null ? 9_999_999 : Math.round(profit * 100);

  return (
    <div
      style={{ order: orderValue }} data-profit={profit ?? "unknown"}
      onClick={onCardClick}
      className={[
        'relative',
        'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow',
        'p-5 lg:p-6',
        'min-h-[480px]',
        'cursor-pointer',
        className ?? '',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {group?.name ?? 'Groupe sans nom'}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {group?.level && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 px-2 py-0.5 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Niveau : {group.level}
              </span>
            )}
            {(teacherName || summary?.teacher_name) && (
              <span>Enseignant : <span className="font-medium text-gray-800 dark:text-gray-200">{teacherLabel}</span></span>
            )}
            {group?.scheduleText && (
              <span className="truncate max-w-[50ch]" title={group.scheduleText}>
                • {group.scheduleText}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Dates</div>
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {group?.startDate ? new Date(group.startDate).toLocaleDateString() : '—'}
              <span className="mx-1">→</span>
              {group?.endDate ? new Date(group.endDate).toLocaleDateString() : '—'}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowForm(true); }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Modifier le groupe"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-9.9 9.9a2 2 0 0 1-.878.507l-3.018.755a.75.75 0 0 1-.91-.91l.755-3.018a2 2 0 0 1 .507-.878l9.9-9.9Z" /><path d="M12.172 4.999 15 7.828" /></svg>
            Modifier
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {/* Students */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Élèves</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{students.length}</span>
            </div>
            {students.length > 0 && (
              <>
                <ProgressBar value={metrics.paidStudentsCount} max={students.length} />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Payés {metrics.paidStudentsCount}/{students.length}
                  {metrics.unpaidStudentsCount != null && (
                    <span> • Impayés {metrics.unpaidStudentsCount}</span>
                  )}
                </div>
              </>
            )}

            {!!topStudents.length && (
              <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden">
                {topStudents.map((s) => {
                  const r = regSummaries[s.id] ?? null;
                  // status recompute here for display
                  const agreed = n(r?.agreedPrice) ?? 0;
                  const discount = n0(r?.discountAmount);
                  const expected = Math.max(0, agreed - discount);
                  const paid = n0(r?.totalPaid);
                  const outstanding = n(r?.outstandingAmount) ?? Math.max(0, expected - paid);
                  let st: 'PAID' | 'PARTIAL' | 'DUE' = 'DUE';
                  if (expected > 0) {
                    if (outstanding <= 1e-6) st = 'PAID';
                    else if (paid > 0) st = 'PARTIAL';
                  }
                  return (
                    <div key={s.id} className="px-3 py-2 text-sm flex items-center justify-between">
                      <span className="truncate max-w-[38ch] text-gray-900 dark:text-white">{studentLabel(s)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{st}</span>
                    </div>
                  );
                })}
                {students.length > topStudents.length && (
                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">+ {students.length - topStudents.length} autres…</div>
                )}
              </div>
            )}

            {studentsError && (
              <div className="mt-2 text-xs text-rose-600 dark:text-rose-400">{studentsError}</div>
            )}
          </div>
        </div>

        {/* Finance */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Paiements des élèves (totaux)</div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Collecté</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{fmtMoney(metrics.revenueCollected, currency)}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Restant</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{fmtMoney(metrics.revenueOutstanding, currency)}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-gray-500 dark:text-gray-400">Total dû</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{fmtMoney(metrics.revenueDue, currency)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Coûts (totaux)</div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Payé</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{fmtMoney(metrics.totalCostsPaid, currency)}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Impayé</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{fmtMoney(metrics.totalCostsUnpaid, currency)}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-gray-500 dark:text-gray-400">Coûts totaux</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{fmtMoney(metrics.totalCosts, currency)}</dd>
              </div>
              {/*metrics.totalOutstanding !== undefined && (
                <div className="md:col-span-2">
                  <dt className="text-gray-500 dark:text-gray-400">Reste à payer (selon vue)</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{fmtMoney(metrics.totalOutstanding, currency)}</dd>
                </div>
              )*/}
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">Résultat (bénéfice/perte)</div>
        <div className={`text-2xl font-bold ${profitSignClass}`}>{fmtMoney(metrics.profit, currency)}</div>
      </div>

      {/* Overlays */}
      {anyLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/30 backdrop-blur-[1px] rounded-2xl flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
          Chargement…
        </div>
      )}
      {anyError && (
        <div className="mt-3 text-xs text-rose-600 dark:text-rose-400">{anyError}</div>
      )}

      {/* Modal: Group edit */}
      {showForm && (
        <Modal isOpen onClose={() => setShowForm(false)} className={"max-w-[1400px]"}>
          <GroupForm
            initialData={group as any}
            onSubmit={async (data: any) => {
              const res = await api.put(`/groups/${group.id}`, data);
              const updated = (res?.data ?? { ...group, ...data }) as any;
              setShowForm(false);
              setRefreshKey((k) => k + 1);
              try { onUpdated && onUpdated(updated); } catch { }
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div >
  );
}
