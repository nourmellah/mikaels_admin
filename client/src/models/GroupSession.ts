/* eslint-disable @typescript-eslint/no-explicit-any */
// models/GroupSession.ts

/**
 * Data Transfer Object representing a session as returned by the API
 */
export interface GroupSessionDTO {
  id: string;
  groupId: string;
  sessionDate: string;    // YYYY-MM-DD
  startTime: string;      // HH:MM:SS
  endTime: string;        // HH:MM:SS
  isMakeup: boolean;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
}

/**
 * Client-side model for GroupSession, with convenience methods
 */
export class GroupSession implements GroupSessionDTO {
  id: string;
  groupId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  isMakeup: boolean;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;

  constructor(data: GroupSessionDTO) {
    this.id = data.id;
    this.groupId = data.groupId;
    this.sessionDate = data.sessionDate;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.isMakeup = data.isMakeup;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a GroupSession instance from raw JSON (e.g. API response)
   */
  static fromJson(json: any): GroupSession {
    return new GroupSession({
      id: json.id,
      groupId: json.group_id || json.groupId,
      sessionDate: json.session_date || json.sessionDate,
      startTime: json.start_time || json.startTime,
      endTime: json.end_time || json.endTime,
      isMakeup: json.is_makeup ?? json.isMakeup ?? false,
      status: json.status,
      createdAt: json.created_at || json.createdAt,
      updatedAt: json.updated_at || json.updatedAt,
    });
  }

  /**
   * Serialize for sending to the server
   */
  toJson(): Record<string, any> {
    return {
      id: this.id,
      group_id: this.groupId,
      session_date: this.sessionDate,
      start_time: this.startTime,
      end_time: this.endTime,
      is_makeup: this.isMakeup,
      status: this.status,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
