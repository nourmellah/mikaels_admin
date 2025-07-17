class PaymentDTO {
  constructor({
    id,
    registration_id,
    amount,
    date,
    is_paid,
    created_at,
    updated_at
  }) {
    this.id             = id;
    this.registrationId = registration_id;
    this.amount         = amount;
    this.date           = date;
    this.isPaid         = is_paid;
    this.createdAt      = created_at;
    this.updatedAt      = updated_at;
  }

  static fromRow(row) {
    return new PaymentDTO(row);
  }
}

module.exports = PaymentDTO;
