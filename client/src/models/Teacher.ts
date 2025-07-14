export interface TeacherDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  salary: number;
  imageUrl?: string | null;
}

export class Teacher {
  private data: TeacherDTO;

  constructor(data: TeacherDTO) {
    this.data = data;
  }

  get id(): string {
    return this.data.id;
  }

  get firstName(): string {
    return this.data.firstName;
  }

  get lastName(): string {
    return this.data.lastName;
  }

  get fullName(): string {
    return `${this.data.firstName} ${this.data.lastName}`;
  }

  get email(): string {
    return this.data.email;
  }

  get phone(): string {
    return this.data.phone ?? '';
  }

  get salary(): number {
    return this.data.salary;
  }

  /**
   * Formats salary in local currency (e.g., €1,200.00)
   */
  get salaryFormatted(): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
    }).format(this.data.salary);
  }

  get imageUrl(): string | null {
    return this.data.imageUrl || null;
  }
}
