class PaymentDTO {
  constructor({ id, student_id, group_id, amount, date, status, created_at, updated_at }) {
    this.id = id;
    this.studentId = student_id;
    this.groupId = group_id;
    this.amount = amount;
    this.date = date;
    this.status = status;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
  static fromRow(row) { return new PaymentDTO(row); }
}
module.exports = PaymentDTO;