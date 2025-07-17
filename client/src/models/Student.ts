/* eslint-disable @typescript-eslint/no-explicit-any */
// src/models/Student.ts

/**
 * Represents a student in the frontend application.
 * Fields mirror the server-side DTO for /students.
 */
export interface StudentDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  groupId?: string | null;
  level?: string | null;
  hasCv: boolean;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * A richer Student model with helper methods.
 */
export class Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  groupId: string | null;
  level: string | null;
  hasCv: boolean;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(dto: StudentDTO) {
    this.id = dto.id;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.email = dto.email;
    this.phone = dto.phone ?? null;
    this.groupId = dto.groupId ?? null;
    this.level = dto.level ?? null;
    this.hasCv = dto.hasCv;
    this.imageUrl = dto.imageUrl ?? null;
    this.createdAt = new Date(dto.createdAt);
    this.updatedAt = new Date(dto.updatedAt);
  }

  /** Full name convenience getter */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /** Age of record in days */
  get ageInDays(): number {
    const diff = Date.now() - this.createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /** Factory from raw JSON */
  static fromJSON(json: any): Student {
    return new Student({
      id: json.id,
      firstName: json.firstName,
      lastName: json.lastName,
      email: json.email,
      phone: json.phone,
      groupId: json.groupId,
      level: json.level,
      hasCv: json.hasCv,
      imageUrl: json.imageUrl,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    });
  }
}
