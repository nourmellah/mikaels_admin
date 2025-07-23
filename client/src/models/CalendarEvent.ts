export interface CalendarEvent {
  id: string;
  title: string;
  start?: Date;
  end?: Date;
  extendedProps: {
    sessionId: string | null;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    teacherName?: string;
    groupId: string;
  };
}