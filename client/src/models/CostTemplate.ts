// src/models/CostTemplate.ts

/**
 * Data transfer object for a cost template, as returned by the API.
 */
export interface CostTemplateDTO {
  /** Unique identifier for the template */
  id: string;

  /** Group Id */
  groupId?: string | null;

  /** Descriptive name of the cost template */
  name: string;

  /** Frequency of recurrence (e.g. 'daily', 'monthly') */
  frequency: string;

  /** Monetary amount associated with the template */
  amount: number;

  /** Optional notes or description */
  notes?: string | null;

  /** Timestamp when the template was created */
  createdAt: string;

  /** Timestamp when the template was last updated */
  updatedAt: string;
}

/**
 * Domain object wrapper around CostTemplateDTO, providing
 * convenient getters for template properties.
 */
export class CostTemplate {
  private data: CostTemplateDTO;

  constructor(data: CostTemplateDTO) {
    this.data = data;
  }

  /** Template ID */
  get id(): string {
    return this.data.id;
  }

  get groupId(): string | null {
    return this.data.groupId ?? null;
  }

  /** Template name */
  get name(): string {
    return this.data.name;
  }

  /** Recurrence frequency */
  get frequency(): string {
    return this.data.frequency;
  }

  /** Monetary amount */
  get amount(): number {
    return this.data.amount;
  }

  /** Optional notes */
  get notes(): string | null {
    return this.data.notes ?? null;
  }

  /** Created timestamp */
  get createdAt(): string {
    return this.data.createdAt;
  }

  /** Updated timestamp */
  get updatedAt(): string {
    return this.data.updatedAt;
  }
}
