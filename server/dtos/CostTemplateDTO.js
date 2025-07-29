class CostTemplateDTO {
  constructor({
    id,
    name,
    frequency,
    amount,
    notes,
    group_id,           // ← new
    created_at,
    updated_at
  }) {
    this.id         = id;
    this.name       = name;
    this.frequency  = frequency;
    this.amount     = amount;
    this.notes      = notes;
    this.groupId    = group_id;   // ← new
    this.createdAt  = created_at;
    this.updatedAt  = updated_at;
  }

  static fromRow(row) {
    return new CostTemplateDTO(row);
  }
}
