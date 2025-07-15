class CostOccurrenceDTO {
  constructor({
    id,
    cost_id,
    due_date,
    amount,
    paid_date,
    created_at,
    updated_at
  }) {
    this.id         = id;
    this.costId     = cost_id;
    this.dueDate    = due_date;
    this.amount     = amount;
    this.paidDate   = paid_date;
    this.createdAt  = created_at;
    this.updatedAt  = updated_at;
  }

  static fromRow(row) {
    return new CostOccurrenceDTO(row);
  }
}

module.exports = CostOccurrenceDTO;
