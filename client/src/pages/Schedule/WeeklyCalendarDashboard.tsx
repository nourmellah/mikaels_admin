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
import Alert from '../../components/ui/alert/Alert';
import { ScheduleAlert } from '../../models/ScheduleAlert';

function formatLocalDate(d: Date): string {
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  return `${Y}-${M}-${D}`;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7)); // Monday as start of week, Sunday = day 6
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function WeeklyCalendarDashboard() {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [schedules, setSchedules] = useState<GroupSchedule[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<GroupSchedule | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<ScheduleAlert[]>([]);

  const localDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    async function fetchData() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [schedRes, grpRes, tchRes, sessRes] = await Promise.all([
        api.get('/group-schedules'),
        api.get('/groups'),
        api.get('/teachers'),
        api.get('/group-sessions')
      ]);

      const schedules = schedRes.data.map((j: any) => GroupSchedule.fromJson(j));
      setSchedules(schedules);

      const groupsById = new Map(grpRes.data.map((g: any) => [g.id, g]));
      const teachersById = new Map(tchRes.data.map((t: any) => [t.id, `${t.firstName} ${t.lastName}`]));
      const sessions = sessRes.data;

      const events: CalendarEvent[] = [];

      // Existing sessions (past and future)
      for (const ss of sessions) {
        const group = groupsById.get(ss.groupId) as GroupDTO | undefined;
        const teacherName = group && teachersById.get(group.teacherId) as string | undefined;

        // Parse sessionDate as a full ISO string (including time if present)
        // This preserves any UTC shift that may have occurred in the backend
        let sessionDateObj = new Date(ss.sessionDate);

        // If the backend sends sessionDate as "YYYY-MM-DD" (no time), treat as local midnight
        // If it sends "YYYY-MM-DDTHH:mm:ss.sssZ", Date() parses as UTC
        // To always treat as local, check if time is missing
        if (/^\d{4}-\d{2}-\d{2}$/.test(ss.sessionDate)) {
          // No time part, treat as local midnight
          const [year, month, day] = ss.sessionDate.split('-').map(Number);
          sessionDateObj = new Date(year, month - 1, day);
        }

        // Use sessionDateObj as the base date for start/end
        const [startHour, startMinute] = ss.startTime.split(':').map(Number);
        const [endHour, endMinute] = ss.endTime.split(':').map(Number);

        const start = new Date(sessionDateObj);
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date(sessionDateObj);
        end.setHours(endHour, endMinute, 0, 0);

        console.log('Session start:', start, 'end:', end);

        events.push({
          id: `session_${ss.id}`,
          title: group?.name || 'Cours',
          start: start,
          end: end,
          extendedProps: {
            sessionId: ss.id,
            status: ss.status,
            teacherName,
            groupId: ss.groupId
          }
        });
      }

      // Recurring schedules starting today
      for (const sched of schedules) {
        const group = groupsById.get(sched.groupId) as GroupDTO | undefined;
        if (!group) continue;
        const teacherName = teachersById.get(group.teacherId) as string | undefined;

        const end = new Date(group.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const current = new Date(today);
        const offset = (sched.dayOfWeek + 7 - current.getDay()) % 7;
        current.setDate(current.getDate() + offset);

        while (current <= end) {
          const dateStr = localDateStr(current);
          console.log(new Date(sessions[0].sessionDate).getTime(), new Date(dateStr).getTime(), new Date().getTimezoneOffset() * 60000);
          const exists = sessions.find((ss: any) =>
            ss.groupId === sched.groupId &&
            new Date(ss.sessionDate).getTime() - new Date().getTimezoneOffset() * 60000 
              === new Date(dateStr).getTime() &&
            ss.startTime === sched.startTime &&
            ss.endTime === sched.endTime
          );
          if (!exists && sched.startTime && sched.endTime) {
            const start = new Date(`${dateStr}T${sched.startTime}`);
            const end = new Date(`${dateStr}T${sched.endTime}`);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

            console.log('Schedule start:', start, 'end:', end);

            events.push({
              id: `schedule_${sched.id}_${dateStr}`,
              title: group.name,
              start: start,
              end: end,
              extendedProps: {
                sessionId: null,
                status: 'PENDING',
                teacherName,
                groupId: sched.groupId
              }
            });
          }

          current.setDate(current.getDate() + 7);
        }
      }

      setEvents(events);

      const alertList: ScheduleAlert[] = [];
      for (const [gid, group] of groupsById.entries()) {
        const groupDTO = group as GroupDTO;
        const weekHrs = Number(groupDTO.weeklyHours);
        const grpScheds: GroupSchedule[] = schedules.filter((s: GroupSchedule) => s.groupId === gid);
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
    fetchData();
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
    if ((clickInfo.jsEvent.target as HTMLElement).closest('.event-action-btn')) return;
    const sched = schedules.find(s => `${s.id}_${formatLocalDate(clickInfo.event.start!)} === ${clickInfo.event.id}`);
    if (!sched) return;
    setSelectedSchedule(sched);
    setModalOpen(true);
  };

  // render event with conditional action/status
  function EventContentWithAction({ info }: { info: EventContentArg }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { sessionId, status } = info.event.extendedProps;

    const onMark = async (newStatus: 'COMPLETED' | 'CANCELLED', e: React.MouseEvent) => {
      const ne = e.nativeEvent as unknown as MouseEvent;
      ne.stopImmediatePropagation();
      ne.stopPropagation();
      e.preventDefault();

      console.log('Event start day:', info.event.startStr || 'unknown');
      console.log('Marking session', sessionId, 'as', newStatus);

      const { groupId } = info.event.extendedProps;

      // if session exists, update; else create new one
      if (sessionId) {
      await api.put(`/group-sessions/${sessionId}`, { status: newStatus });
      } else {
      // Use the event's start date, but format as YYYY-MM-DD in the event's local time (not UTC)
      const eventStart = info.event.start!;
      const sessionDate = [
        eventStart.getFullYear(),
        String(eventStart.getMonth() + 1).padStart(2, '0'),
        String(eventStart.getDate()).padStart(2, '0')
      ].join('-');

      const startTime = eventStart.toTimeString().substr(0, 5) + ':00';

      const eventEnd = info.event.end!;
      const endTime = eventEnd.toTimeString().substr(0, 5) + ':00';

      console.log('Creating session for date:', sessionDate, 'start:', startTime, 'end:', endTime);

      await api.post('/group-sessions', {
        groupId,
        sessionDate,
        startTime,
        endTime,
        isMakeup: false,
        status: newStatus
      });
      }

      console.log('Marked session', sessionId, 'as', newStatus);
      setMenuOpen(false);
      // refresh data
      setCurrentWeekStart(getStartOfWeek(currentWeekStart));
    };

    return (
      <div className="relative p-1">
        <div className="text-xs leading-tight">
          <span>{info.timeText}</span>
          <span className="font-medium block">{info.event.title}</span>
          {info.event.extendedProps.teacherName && (
            <span className="italic block text-xs">{info.event.extendedProps.teacherName}</span>
          )}
        </div>
        {/* show icon or action button */}
        <button
          onClick={e => { e.nativeEvent.stopImmediatePropagation(); setMenuOpen(!menuOpen); }}
          className={`absolute top-1 right-1 w-5 h-5 ${status === 'COMPLETED'
            ? 'bg-green-400 hover:bg-green-300'
            : status === 'CANCELLED'
              ? 'bg-red-400 hover:bg-red-300'
              : 'bg-yellow-400 hover:bg-yellow-300'
            } text-black rounded-full text-xs flex items-center justify-center`}
          title="Marquer"
        >
          {(status === 'COMPLETED' && '✓') || (status === 'CANCELLED' && '✕') || '?'}
        </button>
        {menuOpen && (
          <div className="absolute top-6 right-1 bg-white dark:bg-gray-800 border rounded shadow p-1 flex space-x-1">
            <button onClick={e => onMark('COMPLETED', e)} className="text-black w-5 h-5 bg-green-300">✓</button>
            <button onClick={e => onMark('CANCELLED', e)} className="text-black w-5 h-5 bg-red-300">✕</button>
          </div>
        )}
      </div>
    );
  }

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
          eventContent={(info) => <EventContentWithAction info={info} />}
          height="auto"
        />
      </div>

      {modalOpen && selectedSchedule && (
        <ScheduleModal
          schedule={selectedSchedule}
          onSave={handleSave}
          onDelete={selectedSchedule.id ? handleDelete : undefined}
          onCancel={() => setModalOpen(false)}
          className="max-w-[700px]"
        />
      )}
    </>
  );
}
