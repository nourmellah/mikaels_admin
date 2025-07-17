/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Frontend DTO for a registration record, matching the server's /registrations schema.
 */
export interface RegistrationDTO {
  id: string;
  studentId: string;
  groupId: string;
  agreedPrice: number;
  depositPct: number;
  discountAmount: number;
  registrationDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Richer Registration model with Date objects and helper methods.
 */
export class Registration {
  id: string;
  studentId: string;
  groupId: string;
  agreedPrice: number;
  depositPct: number;
  discountAmount: number;
  registrationDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(dto: RegistrationDTO) {
    this.id = dto.id;
    this.studentId = dto.studentId;
    this.groupId = dto.groupId;
    this.agreedPrice = dto.agreedPrice;
    this.depositPct = dto.depositPct;
    this.discountAmount = dto.discountAmount;
    this.registrationDate = new Date(dto.registrationDate);
    this.status = dto.status;
    this.createdAt = new Date(dto.createdAt);
    this.updatedAt = new Date(dto.updatedAt);
  }

  /**
   * Factory to convert raw JSON from API into a Registration instance.
   */
  static fromJson(json: any): Registration {
    const dto: RegistrationDTO = {
      id:                json.id,
      studentId:         json.studentId ?? json.student_id,
      groupId:           json.groupId   ?? json.group_id,
      agreedPrice:       json.agreedPrice       ?? json.agreed_price,
      depositPct:        json.depositPct        ?? json.deposit_pct,
      discountAmount:    json.discountAmount    ?? json.discount_amount,
      registrationDate:  json.registrationDate  ?? json.registration_date,
      status:            json.status,
      createdAt:         json.createdAt         ?? json.created_at,
      updatedAt:         json.updatedAt         ?? json.updated_at,
    };
    return new Registration(dto);
  }

  /**
   * Computes the outstanding balance given total paid so far.
   */
  outstanding(paidSoFar: number): number {
    return this.agreedPrice - this.discountAmount - paidSoFar;
  }
}
