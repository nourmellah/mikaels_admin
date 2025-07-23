class GroupSessionDTO {
  constructor({ id, group_id, session_date, start_time, end_time, is_makeup, status, created_at, updated_at }) {
    this.id = id;
    this.groupId = group_id;
    this.sessionDate = session_date;
    this.startTime = start_time;
    this.endTime = end_time;
    this.isMakeup = is_makeup;
    this.status = status;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  static fromRow(row) {
    return new GroupSessionDTO(row);
  }
}

module.exports = GroupSessionDTO;
