class StudentBalanceDTO {
  constructor({ student_id, first_name, last_name, group_id, group_name, total_price, paid_to_date, outstanding_amount }) {
    this.studentId = student_id;
    this.firstName = first_name;
    this.lastName = last_name;
    this.groupId = group_id;
    this.groupName = group_name;
    this.totalPrice = total_price;
    this.paidToDate = paid_to_date;
    this.outstandingAmount = outstanding_amount;
  }
  static fromRow(row) { return new StudentBalanceDTO(row); }
}
module.exports = StudentBalanceDTO;
