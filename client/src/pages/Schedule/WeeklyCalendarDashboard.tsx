/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
import api from '../../api';
import { GroupSchedule, GroupScheduleDTO } from '../../models/GroupSchedule';
import { CalendarEvent } from '../../models/CalendarEvent';
import ScheduleModal from '../../components/schedule/ScheduleModal';
import { GroupDTO } from '../../models/Group';
import Alert from '../../components/ui/alert/Alert';
import { ScheduleAlert } from '../../models/ScheduleAlert';
import { GroupSession, GroupSessionDTO } from '../../models/GroupSession';
import React from 'react';
import { TeacherDTO } from '../../models/Teacher';

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
  const [schedules, setSchedules] = useState<GroupScheduleDTO[]>([]);
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Partial<GroupScheduleDTO & { sessionId?: string }>>();
  const [modalOpen, setModalOpen] = useState(false);
  const [groupsById, setGroupsById] = useState<Map<string, GroupDTO>>(new Map());
  const [teachersById, setTeachersById] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    async function fetchData() {
      try {
        const [schedRes, grpRes, tchRes, sessRes] = await Promise.all([
          api.get('/group-schedules'),
          api.get('/groups'),
          api.get('/teachers'),
          api.get('/group-sessions'),
        ]);

        const scheds: GroupScheduleDTO[] = schedRes.data.map((j: any) =>
          GroupSchedule.fromJson(j)
        );
        const sess: GroupSession[] = sessRes.data.map((j: any) =>
          GroupSession.fromJson(j)
        );

        setSchedules(scheds);
        setSessions(sess);

        setGroupsById(
          new Map((grpRes.data as GroupDTO[]).map(g => [g.id, g]))
        );
        setTeachersById(
          new Map((tchRes.data as TeacherDTO[]).map(t => [t.id, `${t.firstName} ${t.lastName}`]))
        );
      } catch (err) {
        console.error('Calendar fetch error', err);
      }
    }
    fetchData();
  }, [currentWeekStart]);

  const events = React.useMemo<CalendarEvent[]>(() => {
    const evts: CalendarEvent[] = [];

    // sessions
    for (const ss of sessions) {
      const group = groupsById.get(ss.groupId) as GroupDTO | undefined;
      const teacherName = group && group.teacherId
        ? teachersById.get(group.teacherId) as string
        : undefined;
      let dateObj = new Date(ss.sessionDate);
      if (/^\d{4}-\d{2}-\d{2}$/.test(ss.sessionDate)) {
        const [y, m, d] = ss.sessionDate.split('-').map(Number);
        dateObj = new Date(y, m - 1, d);
      }
      const [sh, sm] = ss.startTime.split(':').map(Number);
      const [eh, em] = ss.endTime.split(':').map(Number);
      const start = new Date(dateObj); start.setHours(sh, sm, 0, 0);
      const end = new Date(dateObj); end.setHours(eh, em, 0, 0);
      evts.push({
        id: `session_${ss.id}`,
        title: group?.name || 'Session',
        start,
        end,
        extendedProps: { sessionId: ss.id, status: ss.status, teacherName, groupId: ss.groupId }
      });
    }

    // schedules
    for (const sched of schedules) {
      const group = groupsById.get(sched.groupId) as GroupDTO | undefined;

      if (!group || !group.startDate || !group.endDate) continue;

      const periodStart = new Date(group.startDate);
      const periodEnd = new Date(group.endDate);

      const teacherName = group && group.teacherId
        ? teachersById.get(group.teacherId) as string
        : undefined;

      const first = new Date(periodStart);
      const offset = (sched.dayOfWeek + 7 - first.getDay()) % 7;
      first.setDate(first.getDate() + offset);

      const dt = new Date(first);
      while (dt <= periodEnd) {
        const dateStr = formatLocalDate(dt);

        // skip if there’s already a session that day
        const hasSession = sessions.some(ss =>
          ss.groupId === sched.groupId &&
          formatLocalDate(new Date(ss.sessionDate)) === dateStr
        );
        if (!hasSession) {
          const start = new Date(dt);
          const [startHour, startMinute] = sched.startTime.split(':').map(Number);
          start.setHours(startHour, startMinute, 0, 0);
          const end = new Date(dt);
          const [endHour, endMinute] = sched.endTime.split(':').map(Number);
          end.setHours(endHour, endMinute, 0, 0);

          evts.push({
            id: `schedule_${sched.id}_${dateStr}`,
            title: group.name,
            start,
            end,
            extendedProps: { sessionId: null, status: 'PENDING', teacherName, groupId: sched.groupId }
          });
        }

        // jump a week
        dt.setDate(dt.getDate() + 7);
      }
    }

    return evts;
  }, [sessions, schedules, groupsById, teachersById]);

  const alerts = React.useMemo<ScheduleAlert[]>(() => {
    const list: ScheduleAlert[] = [];

    groupsById.forEach((group, groupId) => {
      const expectedHrs = Number(group.weeklyHours);
      const groupScheds = schedules.filter(s => s.groupId === groupId);

      const totalHrs = groupScheds.reduce((sum, s) => {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
      }, 0);
      // if it deviates, emit an alert
      if (Math.abs(totalHrs - expectedHrs) > 1e-6) {
        list.push({
          groupId,
          groupName: group.name,
          scheduled: Number(totalHrs.toFixed(2)),
          expected: expectedHrs
        });
      }
    });
    return list;
  }, [schedules, groupsById]);


  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const start = selectInfo.start;
    const end = selectInfo.end;

    const newSched: Partial<GroupScheduleDTO> & { date: string } = {
      id: '',
      groupId: '',
      date: start.toISOString().substring(0, 10), // YYYY-MM-DD
      dayOfWeek: start.getDay(),
      startTime: `${start.getHours()}`.padStart(2, '0') + ':' + `${start.getMinutes()}`.padStart(2, '0'),
      endTime: `${end.getHours()}`.padStart(2, '0') + ':' + `${end.getMinutes()}`.padStart(2, '0'),
    };

    setSelectedSchedule(newSched);
    setModalOpen(true);
  };

const handleEventClick = (clickInfo: EventClickArg) => {
  const ev    = clickInfo.event;
  const props = ev.extendedProps as any;
  const pad   = (n: number) => String(n).padStart(2, '0');

  if (props.sessionId != null) {
    // a real session
    const date = ev.start!;
    const sessionDto: GroupSessionDTO = {
      id:          props.sessionId,
      groupId:     props.groupId,
      sessionDate: date.toISOString().slice(0, 10),
      startTime:   `${pad(date.getHours())}:${pad(date.getMinutes())}:00`,
      endTime:     `${pad(ev.end!.getHours())}:${pad(ev.end!.getMinutes())}:00`,
      isMakeup:    props.status === 'COMPLETED' && !!props.isMakeup,
      status:      props.status, 
      createdAt:   '',
      updatedAt:   ''
    };
    setSelectedSchedule(sessionDto);

  } else {
    // a recurring schedule
    const date = ev.start!;
    const scheduleId = ev.id.split('_')[1];  // e.g. "schedule_42_2025-07-14"
    const scheduleDto: GroupScheduleDTO = {
      id:         scheduleId,
      groupId:    props.groupId,
      dayOfWeek:  date.getDay(),
      startTime:  `${pad(date.getHours())}:${pad(date.getMinutes())}:00`,
      endTime:    `${pad(ev.end!.getHours())}:${pad(ev.end!.getMinutes())}:00`,
      createdAt:  '',
      updatedAt:  ''
    };
    setSelectedSchedule(scheduleDto);
  }

  setModalOpen(true);
};


  const handleSave = async (sched: GroupScheduleDTO) => {
    const payload = { groupId: sched.groupId, dayOfWeek: sched.dayOfWeek, startTime: sched.startTime, endTime: sched.endTime };
    if (sched.id) await api.put(`/group-schedules/${sched.id}`, payload);
    else await api.post('/group-schedules', payload);
    setModalOpen(false);
    setCurrentWeekStart(getStartOfWeek(currentWeekStart));
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/group-schedules/${id}`);
    setModalOpen(false);
    setCurrentWeekStart(getStartOfWeek(currentWeekStart));
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const handleSaveSession = async (ss: Partial<GroupSession> & { sessionId?: string }) => {
    const payload = { groupId: ss.groupId, sessionDate: ss.sessionDate, startTime: ss.startTime, endTime: ss.endTime, status: ss.status };
    if (ss.sessionDate) await api.put(`/group-sessions/${ss.id}`, payload);
    else await api.post('/group-sessions', payload);
    setModalOpen(false);
    setCurrentWeekStart(getStartOfWeek(currentWeekStart));
  };

  const handleDeleteSession = async (sessionId: string) => {
    await api.delete(`/group-sessions/${sessionId}`);
    setModalOpen(false);
    setCurrentWeekStart(getStartOfWeek(currentWeekStart));
    setSessions(sessions.filter(s => s.id !== sessionId));
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


        await api.post('/group-sessions', {
          groupId,
          sessionDate,
          startTime,
          endTime,
          isMakeup: false,
          status: newStatus
        });
      }
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

  return (
    <>
      {/* schedule alerts */}
      <div className="mb-4 space-y-1">
        {alerts.map(a => (
          <Alert
            key={a.groupId}
            variant="warning"
            title={`Planning incomplet pour ${a.groupName}`}
            message={`Heures planifiées cette semaine: ${a.scheduled}h, attendu: ${a.expected}h.`}
          />
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          slotMinTime="07:00:00"
          slotMaxTime="30:00:00"
          scrollTime={"07:00:00"}
          scrollTimeReset={false}
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

      {modalOpen && selectedSchedule && (<>
        <ScheduleModal
          schedule={selectedSchedule}
          onSave={handleSave}
          onSaveSession={handleSaveSession}
          onDelete={selectedSchedule.id ? handleDelete : undefined}
          onDeleteSession={selectedSchedule.id ? handleDeleteSession : undefined}
          onCancel={() => setModalOpen(false)} /></>
      )}
    </>
  );
}
