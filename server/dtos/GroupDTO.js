class GroupDTO {
  constructor({ id, name, level, start_date, end_date, weekly_hours, price, teacher_id, image_url, created_at, updated_at }) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.startDate = start_date;
    this.endDate = end_date;
    this.weeklyHours = weekly_hours;
    this.price = price;
    this.teacherId = teacher_id;
    this.imageUrl = image_url;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
  static fromRow(row) { return new GroupDTO(row); }
}
module.exports = GroupDTO;

