// src/pages/groups/StartGroupNotice.tsx
import api from '../../api';
import { GroupDTO } from '../../models/Group';
import { StudentDTO } from '../../models/Student';
import { TeacherDTO } from '../../models/Teacher';

interface StartGroupNoticeProps {
  group: GroupDTO;
  teacher?: TeacherDTO | null;
  students: StudentDTO[];
  weeklyHours?: number;
  totalHours?: number;
  price?: number;
  onStarted: (startDay: string, endDay: string) => void;
}

export default function StartGroupNotice({
  group,
  teacher,
  students,
  weeklyHours,
  totalHours,
  price,
  onStarted,
}: StartGroupNoticeProps) {
  // Only show if the group hasn't been started yet
  if (group.startDate != null) return null;

  const handleStart = async () => {
    const confirmMsg =
      "Le groupe n'a pas encore commencé !\nVoulez-vous démarrer le groupe aujourd'hui ?";
    if (!window.confirm(confirmMsg)) return;

    const hasTeacher = Boolean(teacher);
    const hasStudents = students && students.length > 0;
    const hasWeekly = typeof weeklyHours === 'number' && weeklyHours > 0;
    const hasTotal = typeof totalHours === 'number' && totalHours > 0;
    const hasPrice = typeof price === 'number' && price > 0;

    console.log

    // Today’s date in YYYY-MM-DD
    const today = new Date();
    const isoToday = today.toISOString().split('T')[0];

    // Calculate number of weeks then end date
    const weeks = Math.ceil(group.totalHours / group.weeklyHours);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + weeks * 7 - 1);
    const isoEnd = endDate.toISOString().split('T')[0];

    try {
      await api.put(`/groups/${group.id}`, {
        startDate: isoToday,
        endDate: isoEnd,
      });
      // Notify parent to update local state
      onStarted(isoToday, isoEnd);
    } catch (err) {
      console.error("Erreur démarrage du groupe", err);
      // Optionally show a toast here
    }

  };

  return (
    <div className="p-4 bg-yellow-100 rounded flex items-center justify-between">
      <span className="font-medium">
        Le groupe n&apos;a pas encore commencé ! Le démarrer ?
      </span>
      <button
        onClick={handleStart}
        className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Démarrer
      </button>
    </div>
  );
}
