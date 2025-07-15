export interface CostDTO {
  id: string;
  name: string;
  description: string;
  type: 'variable' | 'fixed';
  amount: number;
  frequency: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDueDate?: string;
  paid: boolean;
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

  get name(): string {
    return this.data.name;
  }

  get description(): string {
    return this.data.description;
  }

  get type(): 'variable' | 'fixed' {
    return this.data.type;
  }

  get isFixed(): boolean {
    return this.data.type === 'fixed';
  }

  get amount(): number {
    return this.data.amount;
  }

  /**
   * Formats the amount in Tunisian Dinar (e.g., د.ت1 200,000)
   */
  get amountFormatted(): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(this.data.amount);
  }

  get frequency(): string {
    return this.data.frequency;
  }

  get startDate(): string {
    return this.data.startDate.split('T')[0];
  }

  get nextDueDate(): string | null {
    return this.data.nextDueDate
      ? this.data.nextDueDate.split('T')[0]
      : null;
  }

  get paid(): boolean {
    return this.data.paid;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get updatedAt(): string {
    return this.data.updatedAt;
  }
}
