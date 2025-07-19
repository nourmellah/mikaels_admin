/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import api from '../../api';
import { MetricCard, ChartCard, DataTable } from '../../components/dashboard/DashboardWidgets';
import SegmentedBar from '../../components/ecommerce/SegmentedBar';
import MonthlySalesChart from '../../components/ecommerce/MonthlySalesChart';
import MonthlyTarget from '../../components/ecommerce/MonthlyTarget';
import { User, Users, Calendar, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [groupCount, setGroupCount]     = useState<number>(0);
  const [lessonCount, setLessonCount]   = useState<number>(0);
  const [overdueCount, setOverdueCount] = useState<number>(0);
  const [monthlyRegs, setMonthlyRegs]   = useState<Array<{ month: string; value: number }>>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Students and Groups
      const [stuRes, grpRes] = await Promise.all([
        api.get('/students'),
        api.get('/groups')
      ]);
      setStudentCount(stuRes.data.length);
      setGroupCount(grpRes.data.length);

      // Lessons (schedules)
      const schedRes = await api.get('/group-schedules');
      setLessonCount(schedRes.data.length);

      // Registrations and Payments
      const [regRes, payRes] = await Promise.all([
        api.get('/registrations'),
        api.get('/payments')
      ]);

      // Overdue: count regs where paid < agreedPrice
      const overdue = regRes.data.reduce((sum: number, r: any) => {
        const paid = payRes.data
          .filter((p: any) => p.registrationId === r.id)
          .reduce((s: number, p: any) => s + Number(p.amount), 0);
        return sum + (paid < r.agreedPrice ? 1 : 0);
      }, 0);
      setOverdueCount(overdue);

      // Monthly registrations
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const regsMonthly = months.map((m, idx) => ({
        month: m,
        value: regRes.data.filter((r: any) => new Date(r.registrationDate).getMonth() === idx).length
      }));
      setMonthlyRegs(regsMonthly);

      // Total revenue
      const revenue = regRes.data.reduce((sum: number, r: any) => sum + Number(r.agreedPrice), 0);
      setTotalRevenue(revenue);

      // Recent payments
      const recent = payRes.data
        .sort((a: any,b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0,5);
      setRecentPayments(recent);
    }
    fetchData();
  }, []);

  // Compute expected revenue: registrations × price
  const expectedRevenue = monthlyRegs.reduce((sum, mr) => sum + mr.value, 0) * 0; // placeholder if per-reg price unknown

  // Segmented bar values: paid vs expected
  // Here using totalRevenue as paid, and overdueCount*average for expected placeholder
  const avgRegPrice = totalRevenue / (monthlyRegs.reduce((s, m) => s + m.value, 0) || 1);
  const expRev = monthlyRegs.reduce((s, m) => s + m.value * avgRegPrice, 0);
  const paid   = totalRevenue;
  const loss   = Math.max(0, expRev - paid);
  const surplus= Math.max(0, paid - expRev);

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Étudiants totaux" value={studentCount} icon={User} />
        <MetricCard title="Groupes actifs" value={groupCount} icon={Users} />
        <MetricCard title="Leçons programmées" value={lessonCount} icon={Calendar} />
        <MetricCard title="Inscriptions en retard" value={overdueCount} icon={AlertCircle} />
      </div>
      {/* Monthly registrations chart 
      <ChartCard title="Inscriptions mensuelles">
        <MonthlySalesChart data={monthlyRegs} />
      </ChartCard>

      {/* Revenue target vs collected 
      <ChartCard title="Revenu collecté vs attendu">
        <MonthlyTarget title="Revenu mensuel" target={expRev} achieved={paid} />
      </ChartCard>*/}

      {/* Segmented payment overview */}
      <ChartCard title="Vue d'ensemble des paiements">
        <SegmentedBar blue={paid} yellow={expRev} red={loss} green={surplus} />
      </ChartCard>*/

      {/* Recent payments table */}
      <DataTable
        title="Paiements récents"
        columns={[
          { header: 'Date', accessor: 'date' },
          { header: 'Montant (TND)', accessor: 'amount' },
          { header: 'Inscription', accessor: 'registrationId' }
        ]}
        data={recentPayments}
      />
    </div>
  );
}
