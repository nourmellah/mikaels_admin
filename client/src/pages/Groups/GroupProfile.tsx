/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback, SetStateAction } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import GroupCard from '../../components/groups/GroupCard';
import GroupInfo from '../../components/groups/GroupInfo';
import TeacherCard from '../../components/teachers/TeacherCard';
import StudentCard from '../../components/students/StudentCard';
import api from '../../api';
import ComponentCard from '../../components/common/ComponentCard';
import { GroupDTO } from '../../models/Group';
import { TeacherDTO } from '../../models/Teacher';
import { StudentDTO } from '../../models/Student';
import GroupCostBar from '../../components/ecommerce/SegmentedBar';
import StartGroupNotice from '../../components/groups/StartGroupNotice';
import { PaymentDTO } from '../../models/Payment';
import { RegistrationDTO } from '../../models/Registration';
import { GroupSessionDTO } from '../../models/GroupSession';
import AddStudentsButton from '../../components/students/AddStudentsButton';
import AddTeacherButton from '../../components/teachers/AddTeacherButton';

// Raw view result interface
interface RawCostSummary {
  external_share_pct_total: string;
  group_id: string;
  group_name: string;
  total_hours: string;
  rate: string;
  teacher_amount_due: string;
  teacher_paid: string;
  teacher_unpaid: string;
  group_total_cost: string;
  group_paid_cost: string;
  group_unpaid_cost: string;
  general_paid: string;
  general_unpaid: string;
  total_outstanding: string;
}

// Parsed numeric summary
interface CostSummary {
  externalSharePctTotal: number;
  teacherDue: number;
  internalTotal: number;
  externalTotal: number;
  totalCost: number;
}

export default function GroupProfile() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupDTO | null>(null);
  const [teacher, setTeacher] = useState<TeacherDTO | null>(null);
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationDTO[]>([]);
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [sessions, setSessions] = useState<GroupSessionDTO[]>([]);
  const [rawSummary, setRawSummary] = useState<RawCostSummary | null>(null);

  const navigate = useNavigate();

  const refreshGroupData = useCallback(async () => {
    try {
      // Load group
      const grpRes = await api.get<GroupDTO>(`/groups/${id}`);
      const grp = grpRes.data;
      setGroup(grp);

      // Load teacher
      if (grp.teacherId) {
        const tRes = await api.get<TeacherDTO>(`/teachers/${grp.teacherId}`);
        setTeacher(tRes.data);
      }

      // Load students
      const sRes = await api.get<StudentDTO[]>('/students');
      setStudents(sRes.data.filter(s => String(s.groupId) === id));

      // Load registrations
      const regsRes = await api.get<RegistrationDTO[]>('/registrations');
      const groupRegs = regsRes.data.filter(r => String(r.groupId) === id);
      setRegistrations(groupRegs);

      // Load payments
      const payRes = await api.get<PaymentDTO[]>('/payments');
      setPayments(payRes.data.filter(p => groupRegs.some(r => r.id === p.registrationId)));

      // Load sessions
      const sessRes = await api.get<GroupSessionDTO[]>('/group-sessions');
      setSessions(sessRes.data.filter(s => String(s.groupId) === id));

      // Load cost summary from view
      const sumRes = await api.get<RawCostSummary>(`/groups/${id}/summary`);
      setRawSummary(sumRes.data);
    } catch (err) {
      console.error('Error loading group profile data:', err);
    }
  }, [id]);


  useEffect(() => {
    if (id) refreshGroupData();
  }, [id, refreshGroupData]);

  const handleDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer cette group?")) {
      try {
        await api.delete(`/groups/${id}`);
        navigate('/groups', { replace: true });
      } catch (err) {
        console.error('Erreur de suppression :', err);
      }
    }
  };

  function handleStudentUpdate(): (s: StudentDTO) => void {
    return s => {
      setStudents(prev => prev.map(st => st.id === s.id ? s : st));
      refreshGroupData();
    };
  }

  if (!group || !rawSummary) return <div>Chargement...</div>;

  // Calculate expected total teacher payment (hours x salary)
  const expectedTeacherPayment = teacher ? teacher.salary * group.totalHours : 0;

  const summary: CostSummary = {
    teacherDue: Number(rawSummary.teacher_amount_due),
    internalTotal: Number(rawSummary.group_total_cost),
    externalTotal:
      Number(rawSummary.general_paid) + Number(rawSummary.general_unpaid),
    totalCost:
      expectedTeacherPayment +
      Number(rawSummary.group_total_cost) +
      Number(rawSummary.general_paid) +
      Number(rawSummary.general_unpaid),
    externalSharePctTotal: Number(rawSummary.external_share_pct_total),
  };

  const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const totalDiscount = registrations.reduce(
    (sum, r) => sum + Number((r as any).discountAmount || 0),
    0
  );

  const expectedRevenue = group.price * students.length - totalDiscount;

  const unpaidAmount = Math.max(0, expectedRevenue - paidAmount);

  const diff = expectedRevenue - summary.totalCost;
  const diffLabel = diff >= 0 ? 'Excédent' : 'Perte';
  const diffValue = Math.abs(diff);
  const externalPct = summary?.externalSharePctTotal ?? null;
  const externalPctLabel = externalPct != null ? ` (${Number(externalPct).toFixed(1)}%)` : '';

  const isOver = summary.totalCost > paidAmount;



  return (
    <>
      <PageMeta
        title={`Groupe: ${group.name}`}
        description={`Détails du groupe ${group.name}`}
      />
      <PageBreadcrumb pageTitle="Profil du groupe" />

      <div className="space-y-6">
        {/* Top card */}
        <GroupCard
          group={group}
          professorName={teacher ? `${teacher.firstName} ${teacher.lastName}` : '–'}
          level={group.level}
          onUpdated={g => setGroup(g)}
        />

        {/* Start group notice */}
        <StartGroupNotice
          group={group}
          teacher={teacher}
          students={students}
          weeklyHours={group.weeklyHours}
          totalHours={group.totalHours}
          price={group.price}
          onStarted={(startDate, endDate) =>
            setGroup({ ...group, startDate, endDate })
          }
        />

        {/* Cost Analysis */}
        <ComponentCard title="Analyse des coûts">
          <GroupCostBar
            segments={[
              { value: totalDiscount, label: 'Remise', color: '#805ad5' },
              { value: paidAmount, label: 'Payé', color: '#3182ce' },
              { value: unpaidAmount, label: 'À payer', color: '#d69e2e' },
              { value: diffValue, label: diffLabel, color: diffLabel === 'Perte' ? '#e53e3e' : '#38a169' }
            ]}
            showLabels
            showValues
            height='h-14'
          />

          {/* Details grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Teacher Payment Info */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h5 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Enseignant</h5>
              <dl className="space-y-1">
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Total attendu</dt>
                  <dd className="font-medium text-gray-800 dark:text-gray-100">{expectedTeacherPayment.toFixed(3)} TND</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">À ce jour</dt>
                  <dd className="font-medium text-gray-800 dark:text-gray-100">{summary.teacherDue.toFixed(3)} TND</dd>
                </div>
              </dl>
            </div>

            {/* Internal Costs */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h5 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Coûts internes</h5>
              <p className="font-medium text-gray-800 dark:text-gray-100">{summary.internalTotal.toFixed(3)} TND</p>
            </div>

            {/* External Costs */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h5 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Coûts externes {externalPctLabel}</h5>
              <p className="font-medium text-gray-800 dark:text-gray-100">{summary.externalTotal.toFixed(3)} TND</p>
            </div>
          </div>

          <hr className="my-6 border-t border-gray-300 dark:border-gray-600" />

          {/* Total cost indicator */}
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-800 dark:text-gray-100">Total Coûts</span>
            <span className={`text-xl font-semibold ${isOver ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>{summary.totalCost.toFixed(3)} TND</span>
          </div>
        </ComponentCard>

        {/* Details section */}
        <ComponentCard title="Détailes du groupe">

          <div className="grid grid-cols-1 gap-6">

            <GroupInfo group={group} />
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Professeur
              </h4>
              {teacher ? <TeacherCard teacher={teacher} phone={teacher.phone || '–'} onUpdated={t => setTeacher(t)} />
                : <AddTeacherButton groupId={group.id} onUpdated={refreshGroupData} currentTeacherId={null} />}
            </div>
            {/* Students list */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Étudiants ({students.length})
                </h4>
                <AddStudentsButton
                  groupId={group.id}
                  groupPrice={group.price}
                  onUpdated={refreshGroupData}
                  variant="primary"
                  size="sm"
                />
              </div>
              <div className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">

                  {students.map(student => {
                    const reg = registrations.find(r => r.studentId === student.id);
                    const studentPayments = reg
                      ? payments.filter(p => p.registrationId === reg.id)
                      : [];
                    const paidTotal = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                    const due = Math.max(0, group.price - paidTotal);

                    return (
                      <StudentCard
                        key={student.id}
                        student={student}
                        groupName={group.name}
                        paymentsTotal={paidTotal}
                        paymentsDue={due}
                        registrationId={reg?.id}
                        onUpdated={handleStudentUpdate()}
                      />
                    );
                  })}

                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleDelete}
              className="text-sm font-medium py-2.5 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Supprimer le group
            </button>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
