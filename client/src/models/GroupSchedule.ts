/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GroupScheduleDTO {
  id:            string;
  groupId:       string;
  dayOfWeek:     number;   // 0=Sun…6=Sat
  startTime:     string;   // "HH:MM:SS"
  endTime:       string;   // "HH:MM:SS"
  createdAt:     string;   // ISO timestamp
  updatedAt:     string;
  groupName?:    string;   // optional, filled by join or client
}

export class GroupSchedule {
  id:         string;
  groupId:    string;
  dayOfWeek:  number;
  startTime:  string;
  endTime:    string;
  createdAt:  Date;
  updatedAt:  Date;
  groupName?: string;

  constructor(dto: GroupScheduleDTO) {
    this.id         = dto.id;
    this.groupId    = dto.groupId;
    this.dayOfWeek  = dto.dayOfWeek;
    this.startTime  = dto.startTime;
    this.endTime    = dto.endTime;
    this.createdAt  = new Date(dto.createdAt);
    this.updatedAt  = new Date(dto.updatedAt);
    this.groupName  = dto.groupName;
  }

  /**
   * Factory to create a GroupSchedule from raw API JSON
   */
  static fromJson(json: any): GroupSchedule {
    const dto: GroupScheduleDTO = {
      id:            json.id,
      groupId:       json.groupId   ?? json.group_id,
      dayOfWeek:     json.dayOfWeek ?? json.day_of_week,
      startTime:     json.startTime ?? json.start_time,
      endTime:       json.endTime   ?? json.end_time,
      createdAt:     json.createdAt ?? json.created_at,
      updatedAt:     json.updatedAt ?? json.updated_at,
      groupName:     json.groupName,
    };
    return new GroupSchedule(dto);
  }
}
