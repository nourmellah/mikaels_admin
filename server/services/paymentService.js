const pool       = require('../db');
const PaymentDTO = require('../dtos/PaymentDTO');

/**
 * Fetch all payments, ordered by creation time.
 */
async function getAllPayments() {
  const { rows } = await pool.query(
    'SELECT * FROM payments ORDER BY created_at'
  );
  return rows.map(PaymentDTO.fromRow);
}

/**
 * Fetch payments for a specific registration.
 */
async function listPaymentsForRegistration(registrationId) {
  const { rows } = await pool.query(
    'SELECT * FROM payments WHERE registration_id = $1 ORDER BY created_at',
    [registrationId]
  );
  return rows.map(PaymentDTO.fromRow);
}

/**
 * Fetch a single payment by ID.
 */
async function getPaymentById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM payments WHERE id = $1',
    [id]
  );
  return rows[0] ? PaymentDTO.fromRow(rows[0]) : null;
}

/**
 * Create a new payment.
 */
async function addPayment(data) {
  const {
    registrationId,
    amount,
    date    = null,
    isPaid  = true
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO payments
       (registration_id, amount, date, is_paid)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [registrationId, amount, date, isPaid]
  );

  return PaymentDTO.fromRow(rows[0]);
}

/**
 * Update an existing payment.
 */
async function updatePayment(id, data) {
  const fields = [];
  const values = [];
  let   idx    = 1;

  if (data.registrationId !== undefined) {
    fields.push(`registration_id = $${idx++}`);
    values.push(data.registrationId);
  }
  if (data.amount !== undefined) {
    fields.push(`amount = $${idx++}`);
    values.push(data.amount);
  }
  if (data.date !== undefined) {
    fields.push(`date = $${idx++}`);
    values.push(data.date);
  }
  if (data.isPaid !== undefined) {
    fields.push(`is_paid = $${idx++}`);
    values.push(data.isPaid);
  }

  if (fields.length === 0) {
    return getPaymentById(id);
  }

  // always update the timestamp
  fields.push(`updated_at = now()`);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE payments
        SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *`,
    values
  );

  return rows[0] ? PaymentDTO.fromRow(rows[0]) : null;
}

/**
 * Delete a payment.
 */
async function deletePayment(id) {
  await pool.query(
    'DELETE FROM payments WHERE id = $1',
    [id]
  );
}

module.exports = {
  getAllPayments,
  listPaymentsForRegistration,
  getPaymentById,
  addPayment,
  updatePayment,
  deletePayment
};
