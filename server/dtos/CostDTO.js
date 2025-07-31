class CostDTO {
  constructor({
    id,
    cost_template_id,
    group_id,
    name,
    due_date,
    amount,
    paid,
    paid_date,
    notes, 
    created_at,
    updated_at
  }) {
    this.id             = id;
    this.costTemplateId = cost_template_id;
    this.name           = name;
    this.dueDate        = due_date;
    this.amount         = amount;
    this.paid           = paid;
    this.paidDate       = paid_date;
    this.notes          = notes;
    this.groupId        = group_id; 
    this.createdAt      = created_at;
    this.updatedAt      = updated_at;
  }

  static fromRow(row) {
    return new CostDTO(row);
  }
}

module.exports = CostDTO;
