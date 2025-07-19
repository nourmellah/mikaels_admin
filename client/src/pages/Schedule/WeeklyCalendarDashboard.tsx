/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
import api from '../../api';
import { GroupSchedule } from '../../models/GroupSchedule';
import { CalendarEvent } from '../../models/CalendarEvent';
import ScheduleModal from '../../components/schedule/ScheduleModal';
import { GroupDTO } from '../../models/Group';
import { TeacherDTO } from '../../models/Teacher';
import Alert from '../../components/ui/alert/Alert';
import { ScheduleAlert } from '../../models/ScheduleAlert';

export default function WeeklyCalendarDashboard() {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [schedules, setSchedules] = useState<GroupSchedule[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<GroupSchedule | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<ScheduleAlert[]>([]);


  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  useEffect(() => {
    async function fetchSchedules() {
      const res = await api.get('/group-schedules');
      const models: GroupSchedule[] = res.data.map((json: any) => GroupSchedule.fromJson(json));
      setSchedules(models);

      // fetch groups and teachers
      const [grpRes, tchRes] = await Promise.all([
        api.get('/groups'),
        api.get('/teachers'),
      ]);
      const groupsById = new Map(grpRes.data.map((g: any) => [g.id, g]));
      const teachersById = new Map(tchRes.data.map((t: any) => [t.id, t]));

      const evs = models.map(s => {
        const group = groupsById.get(s.groupId) as GroupDTO;
        const teacher = group && teachersById.get(group.teacherId || '') as TeacherDTO;
        const teacherName = teacher
          ? `${teacher.firstName} ${teacher.lastName}`
          : undefined;

        return {
          id: s.id,
          title: group.name ?? 'Cours',
          daysOfWeek: [s.dayOfWeek],         
          startTime: s.startTime.slice(0, 5),
          endTime: s.endTime.slice(0, 5),
          extendedProps: {
            groupId: s.groupId,
            teacherName,
          }
        } as any;
      });
      setEvents(evs);

      const alertList: ScheduleAlert[] = [];
      for (const [gid, group] of groupsById.entries()) {
        const groupDTO = group as GroupDTO;
        const weekHrs = Number(groupDTO.weeklyHours);
        // sum durations of schedules for this gid
        const grpScheds = models.filter(s => s.groupId === gid);
        const totalScheduled = grpScheds.reduce((sum, s) => {
          const [sh, sm] = s.startTime.split(':').map(Number);
          const [eh, em] = s.endTime.split(':').map(Number);
          return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
        }, 0);
        if (Math.abs(totalScheduled - weekHrs) > 1e-6) {
          alertList.push({
            groupId: String(gid),
            groupName: groupDTO.name,
            scheduled: Number(totalScheduled.toFixed(2)),
            expected: weekHrs,
          });
        }
      }
      setAlerts(alertList);
    }
    fetchSchedules();
  }, [currentWeekStart]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const date = selectInfo.start;
    const day = date.getDay();
    const startTime = date.toTimeString().substr(0, 5) + ':00';
    const endTime = selectInfo.end.toTimeString().substr(0, 5) + ':00';
    const newSched = new GroupSchedule({
      id: '', groupId: '', dayOfWeek: day,
      startTime, endTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      groupName: undefined,
    });
    setSelectedSchedule(newSched);
    setModalOpen(true);
    calendarRef.current?.getApi().unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const sched = schedules.find(s => s.id === clickInfo.event.id);
    if (!sched) return;
    setSelectedSchedule(sched);
    setModalOpen(true);
  };

  // Custom event renderer to show time, group name, and teacher
  const renderEventContent = (arg: EventContentArg) => {
    const timeText = arg.timeText;
    const title = arg.event.title;
    const teacher = arg.event.extendedProps.teacherName;
    return (
      <div className="flex flex-col text-xs leading-tight">
        <span>{timeText}</span>
        <span className="font-medium">{title}</span>
        {teacher && <span className="italic">{teacher}</span>}
      </div>
    );
  };

  const handleSave = async (sched: GroupSchedule) => {
    const payload = {
      groupId: sched.groupId,
      dayOfWeek: sched.dayOfWeek,
      startTime: sched.startTime,
      endTime: sched.endTime,
    };
    if (sched.id) await api.put(`/group-schedules/${sched.id}`, payload);
    else await api.post('/group-schedules', payload);
    setModalOpen(false);
    setCurrentWeekStart(getStartOfWeek(currentWeekStart));
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/group-schedules/${id}`);
    setModalOpen(false);
    setCurrentWeekStart(getStartOfWeek(currentWeekStart));
  };

  return (
    <>
      {/* schedule alerts */}
      {alerts.map(a => (
        <Alert
          key={a.groupId}
          variant="warning"
          title={`Planning incomplet pour ${a.groupName}`}
          message={`Heures planifiées cette semaine: ${a.scheduled}h, attendu: ${a.expected}h.`}
        />
      ))}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={frLocale}
          firstDay={1}
          headerToolbar={{ left: 'prev today next', center: 'title', right: '' }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
        />
      </div>

      {modalOpen && selectedSchedule && (
        <ScheduleModal
          schedule={selectedSchedule}
          onSave={handleSave}
          onDelete={selectedSchedule.id ? handleDelete : undefined}
          onCancel={() => setModalOpen(false)}
          className="max-w-[1400px]"
        />
      )}
    </>
  );
}
