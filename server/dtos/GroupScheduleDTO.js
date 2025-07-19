class GroupScheduleDTO {
  constructor({
    id,
    group_id,
    day_of_week,
    start_time,
    end_time,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.groupId = group_id;
    this.dayOfWeek = day_of_week;
    this.startTime = start_time;
    this.endTime = end_time;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  static fromRow(row) {
    return new GroupScheduleDTO(row);
  }
}

module.exports = GroupScheduleDTO;