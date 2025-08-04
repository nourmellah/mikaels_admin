import React, { useState, useEffect } from 'react';
import api from '../../api';
import { DollarSign, TrendingUp, AlertCircle, Calendar } from 'lucide-react';

interface DashboardMetrics {
  net_cash_all_time: string;
  student_paid_monthly: string;
  student_expected_monthly: string;
  teacher_paid_monthly: string;
  teacher_expected_monthly: string;
  cost_paid_monthly: string;
  cost_expected_monthly: string;
}

interface SessionRow {
  source: string;
  group_name: string;
  teacher_name: string;
  session_date: string;
  time: string;
}

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get<{metrics: DashboardMetrics; sessions: SessionRow[]}>('/dashboard');
        setMetrics(res.data.metrics);
        setSessions(res.data.sessions);
        console.log(res.data)
      } catch (err) {
        console.error('Error loading dashboard:', err);
      }
    }
    loadDashboard();
  }, []);

  if (!metrics) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Net Cash All Time */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition">
        <div className="flex items-center">
          <DollarSign className="mr-3 text-blue-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Caisse (total)
            </h3>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-gray-100">
              {Number(metrics.net_cash_all_time).toFixed(3)} TND
            </p>
          </div>
        </div>
      </div>

      {/* Student Revenue Monthly */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition">
        <div className="flex items-center">
          <TrendingUp className="mr-3 text-green-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Revenu étudiants (mois)
            </h3>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-gray-100">
              {Number(metrics.student_paid_monthly).toFixed(3)} / {Number(metrics.student_expected_monthly).toFixed(3)} TND
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Payments Monthly */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition">
        <div className="flex items-center">
          <AlertCircle className="mr-3 text-red-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Paiements enseignants (mois)
            </h3>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-gray-100">
              {Number(metrics.teacher_paid_monthly).toFixed(3)} / {Number(metrics.teacher_expected_monthly).toFixed(3)} TND
            </p>
          </div>
        </div>
      </div>

      {/* Other Costs Monthly */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition">
        <div className="flex items-center">
          <AlertCircle className="mr-3 text-yellow-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Autres coûts (mois)
            </h3>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-gray-100">
              {Number(metrics.cost_paid_monthly).toFixed(3)} / {Number(metrics.cost_expected_monthly).toFixed(3)} TND
            </p>
          </div>
        </div>
      </div>

      {/* Sessions Today Table */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Calendar className="mr-2 text-indigo-500" />
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Sessions aujourd&apos;hui
          </h4>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Type
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Groupe
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Enseignant
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Heure
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sessions.length > 0 ? (
              sessions.map((s, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{s.source}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{s.group_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{s.teacher_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{s.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucune séance aujourd&apos;hui
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
