export interface CalendarEvent {
  id:        string;
  title:     string;
  start:     Date;
  end:       Date;
  groupId:   string;
  color?:    string;
}