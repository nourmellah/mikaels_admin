export interface CostDTO {
  id: string;
  costTemplateId?: string | null;
  groupId?: string | null;
  name: string;
  dueDate?: string | null;
  amount: number;
  paid: boolean;
  paidDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class Cost {
  private data: CostDTO;

  constructor(data: CostDTO) {
    this.data = data;
  }

  get id(): string {
    return this.data.id;
  }

  get costTemplateId(): string | null {
    return this.data.costTemplateId ?? null;
  }

  get groupId(): string | null {
    return this.data.groupId ?? null;
  }

  get name(): string {
    return this.data.name;
  }

  get dueDate(): string | null {
    return this.data.dueDate ?? null;
  }

  get amount(): number {
    return this.data.amount;
  }

  get paid(): boolean {
    return this.data.paid;
  }

  get paidDate(): string | null {
    return this.data.paidDate ?? null;
  }

  get notes(): string | null {
    return this.data.notes ?? null;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get updatedAt(): string {
    return this.data.updatedAt;
  }
}
