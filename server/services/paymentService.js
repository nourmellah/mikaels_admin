const pool = require('../db');
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
 * List payments for a given registration.
 */
async function listPaymentsForRegistration(registrationId) {
  const { rows } = await pool.query(
    'SELECT * FROM payments WHERE registration_id = $1 ORDER BY date',
    [registrationId]
  );
  return rows.map(PaymentDTO.fromRow);
}

/**
 * Create a new payment record.
 */
async function addPayment(data) {
  const { registrationId, amount, date, isPaid } = data;
  const { rows } = await pool.query(
    `INSERT INTO payments
      (registration_id, amount, date, is_paid)
     VALUES ($1,$2,$3,$4)
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
  let idx = 1;

  for (const [key, val] of Object.entries(data)) {
    const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    fields.push(`${col} = $${idx}`);
    values.push(val);
    idx++;
  }
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE payments SET ${fields.join(', ')}
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
  await pool.query('DELETE FROM payments WHERE id = $1', [id]);
}

module.exports = {
  getAllPayments,
  getPaymentById,
  listPaymentsForRegistration,
  addPayment,
  updatePayment,
  deletePayment
};
