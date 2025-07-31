// dtos/StudentPaymentSummaryDTO.js
class StudentPaymentSummaryDTO {
  constructor({
    registration_id,
    student_id,
    first_name,
    last_name,
    group_id,
    group_name,
    agreed_price,
    deposit_pct,
    discount_amount,
    total_paid,
    outstanding_amount
  }) {
    this.registrationId    = registration_id;
    this.studentId         = student_id;
    this.firstName         = first_name;
    this.lastName          = last_name;
    this.groupId           = group_id;
    this.groupName         = group_name;
    this.agreedPrice       = agreed_price;
    this.depositPct        = deposit_pct;
    this.discountAmount    = discount_amount;
    this.totalPaid         = total_paid;
    this.outstandingAmount = outstanding_amount;
  }

  static fromRow(row) {
    return new StudentPaymentSummaryDTO(row);
  }
}

module.exports = StudentPaymentSummaryDTO;
