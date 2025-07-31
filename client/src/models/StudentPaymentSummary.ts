/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StudentPaymentSummaryDTO {
  registrationId:     string;
  studentId:          string;
  firstName:          string;
  lastName:           string;
  groupId:            string;
  groupName:          string;
  agreedPrice:        number;
  depositPct:         number;
  discountAmount:     number;
  totalPaid:          number;
  outstandingAmount:  number;
}

// a quick helper if you want a class
export class StudentPaymentSummary {
  static fromJson(o: any): StudentPaymentSummaryDTO {
    return {
      registrationId:    o.registration_id,
      studentId:         o.student_id,
      firstName:         o.first_name,
      lastName:          o.last_name,
      groupId:           o.group_id,
      groupName:         o.group_name,
      agreedPrice:       Number(o.agreed_price),
      depositPct:        Number(o.deposit_pct),
      discountAmount:    Number(o.discount_amount),
      totalPaid:         Number(o.total_paid),
      outstandingAmount: Number(o.outstanding_amount),
    };
  }
}
