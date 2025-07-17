/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import { CostDTO } from '../../models/Cost';
import StartGroupNotice from '../../components/groups/StartGroupNotice';
import { PaymentDTO } from '../../models/Payment';
import { RegistrationDTO } from '../../models/Registration';

export default function GroupProfile() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupDTO | null>(null);
  const [teacher, setTeacher] = useState<TeacherDTO | null>(null);
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [totalRunningCosts, setTotalRunningCosts] = useState(0);
  const [groupCount, setGroupCount] = useState(1);
  const [registrations, setRegistrations] = useState<RegistrationDTO[]>([]);
  const [payments, setPayments] = useState<PaymentDTO[]>([]);


  useEffect(() => {
    async function fetchData() {
      try {
        // fetch group
        const grpRes = await api.get<GroupDTO>(`/groups/${id}`);
        const grp = grpRes.data;
        setGroup(grp);
        // fetch teacher
        if (grp.teacherId) {
          const tRes = await api.get<TeacherDTO>(`/teachers/${grp.teacherId}`);
          setTeacher(tRes.data);
        }
        // fetch students
        const sRes = await api.get<StudentDTO[]>('/students');
        setStudents(sRes.data.filter(s => String(s.groupId) === String(id)));
        // fetch costs and group count
        const [costsRes, groupsRes] = await Promise.all([
          api.get<CostDTO[]>('/costs'),
          api.get<GroupDTO[]>('/groups')
        ]);
        const sumCosts = costsRes.data.reduce((sum, c) => sum + c.amount, 0);
        setTotalRunningCosts(sumCosts);
        setGroupCount(groupsRes.data.length || 1);
        // Load registrations for this group
        const regsRes = await api.get<RegistrationDTO[]>('/registrations');
        const groupRegs = regsRes.data.filter(r => r.groupId === id);
        setRegistrations(groupRegs);

        // Load all payments and filter to this group's registrations
        const payRes = await api.get<PaymentDTO[]>('/payments');
        const groupPayments = payRes.data.filter(p =>
          groupRegs.some(r => r.id === p.registrationId)
        );
        setPayments(groupPayments);

      } catch (err) {
        console.error('Error loading group profile data:', err);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (!group) {
    return <div>Chargement...</div>;
  }

  // cost calculations
  const teacherCost = teacher ? teacher.salary * group.totalHours : 0;
  const runningShare = totalRunningCosts / groupCount;
  const totalCosts = teacherCost + runningShare;
  // BLUE : amount already paid
  const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const expectedRevenue = group.price * students.length;
  // YELLOW : expected amount not paid yet
  const expectedAmount = Math.max(0, expectedRevenue - paidAmount);
  const profit = (paidAmount + expectedAmount) - totalCosts;
  // RED : loss if profit is negative
  const lossAmount = profit < 0 ? -profit : 0;
  // GREEN : surplus if profit is positive
  const surplusAmount = profit > 0 ? profit : 0;

  console.log('Group costs:', {
    paidAmount,
    expectedAmount,
    lossAmount,
    surplusAmount,
    totalCosts,
    expectedRevenue,
    profit
  });

  const handleGroupUpdate = (updated: GroupDTO) => setGroup(updated);
  const handleTeacherUpdate = (updated: TeacherDTO) => setTeacher(updated);
  const handleStudentUpdate = (updated: StudentDTO) =>
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));

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
          onUpdated={handleGroupUpdate}
        />

        {/* Costs bar */}
        <ComponentCard title="Coûts du groupe">
          <GroupCostBar
            blue={paidAmount}
            yellow={expectedAmount - paidAmount} // not count loss or plus
            red={lossAmount}
            green={surplusAmount}
          />
        </ComponentCard>

        <StartGroupNotice
          group={group}
          onStarted={(startDate, endDate) =>
            setGroup({ ...group, startDate, endDate })
          }
        />

        {/* Details section */}
        <ComponentCard title="Détailes du groupe">

          <div className="grid grid-cols-1 gap-6">

            <GroupInfo group={group} />
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Professeur
              </h4>
              {teacher && (
                <TeacherCard
                  teacher={teacher}
                  phone={teacher.phone || '–'}
                  onUpdated={handleTeacherUpdate}
                />
              )}
            </div>
            {/* Students list */}
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Étudiants ({students.length})
              </h4>
              <div className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">

                  {students.map(student => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      groupName={group.name}
                      onUpdated={handleStudentUpdate}
                    />
                  ))}
                  {students.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aucun étudiant dans ce groupe.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
