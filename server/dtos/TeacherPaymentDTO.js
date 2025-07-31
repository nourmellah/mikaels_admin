class TeacherPaymentDTO {
  constructor({ id, teacher_id, group_id, total_hours, rate, amount, paid, paid_date, created_at, updated_at }) {
    this.id = id;
    this.teacherId = teacher_id;
    this.groupId = group_id;
    this.totalHours = total_hours;
    this.rate = rate;
    this.amount = amount;
    this.paid = paid;
    this.paidDate = paid_date;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  static fromRow(row) {
    return new TeacherPaymentDTO(row);
  }
}

module.exports = TeacherPaymentDTO;
