class CostDTO {
  constructor({ id, name, description, type, amount, frequency, start_date, next_due_date, paid, created_at, updated_at }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.amount = amount;
    this.frequency = frequency;
    this.startDate = start_date;
    this.nextDueDate = next_due_date;
    this.paid = paid;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  static fromRow(row) {
    return new CostDTO(row);
  }
}

module.exports = CostDTO;
