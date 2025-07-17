/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Frontend DTO matching the payments table schema
 */
export interface PaymentDTO {
  id: string;
  registrationId: string;
  amount: number;
  date: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Richer Payment model with typed properties and helpers
 */
export class Payment {
  id: string;
  registrationId: string;
  amount: number;
  date: Date;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(dto: PaymentDTO) {
    this.id = dto.id;
    this.registrationId = dto.registrationId;
    this.amount = dto.amount;
    this.date = new Date(dto.date);
    this.isPaid = dto.isPaid;
    this.createdAt = new Date(dto.createdAt);
    this.updatedAt = new Date(dto.updatedAt);
  }

  /**
   * Factory to create a Payment from raw API JSON
   * Handles snake_case vs camelCase
   */
  static fromJson(json: any): Payment {
    const dto: PaymentDTO = {
      id:               json.id,
      registrationId:   json.registrationId ?? json.registration_id,
      amount:           parseFloat(json.amount),
      date:             json.date,
      isPaid:           json.isPaid ?? json.is_paid,
      createdAt:        json.createdAt ?? json.created_at,
      updatedAt:        json.updatedAt ?? json.updated_at,
    };
    return new Payment(dto);
  }

  /**
   * Returns the payment date as a localized string
   */
  get formattedDate(): string {
    return this.date.toLocaleDateString();
  }

  /**
   * Returns true if this payment record represents an actual payment
   */
  get paid(): boolean {
    return this.isPaid;
  }
}
