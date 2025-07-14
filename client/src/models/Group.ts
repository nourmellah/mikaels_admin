export interface GroupNameDTO {
  id: number | string;
  name: string;
}

export interface GroupDTO {
  id: string;
  name: string;
  level: string;
  startDate: string;
  endDate: string;
  weeklyHours: number;
  totalHours: number;
  price: number;
  teacherId: string | null;
}

export class Group {
  private data: GroupDTO;

  constructor(data: GroupDTO) {
    this.data = data;
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get level(): string {
    return this.data.level;
  }

  get startDate(): string {
    return this.data.startDate;
  }

  get endDate(): string {
    return this.data.endDate;
  }

  get weeklyHours(): number {
    return this.data.weeklyHours;
  }

  get totalHours(): number {
    return this.data.totalHours;
  }

  get price(): number {
    return this.data.price;
  }

  /**
   * Formats price in Tunisian Dinar
   */
  get priceFormatted(): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(this.data.price);
  }

  get teacherId(): string | null {
    return this.data.teacherId;
  }
}
