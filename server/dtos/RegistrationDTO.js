class RegistrationDTO {
  constructor({
    id,
    student_id,
    group_id,
    agreed_price,
    deposit_pct,
    discount_amount,
    registration_date,
    status,
    created_at,
    updated_at
  }) {
    this.id               = id;
    this.studentId        = student_id;
    this.groupId          = group_id;
    this.agreedPrice      = agreed_price;
    this.depositPct       = deposit_pct;
    this.discountAmount   = discount_amount;
    this.registrationDate = registration_date;
    this.status           = status;
    this.createdAt        = created_at;
    this.updatedAt        = updated_at;
  }

  static fromRow(row) {
    return new RegistrationDTO(row);
  }
}

module.exports = RegistrationDTO;
