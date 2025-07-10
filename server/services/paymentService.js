// src/services/paymentService.js
const pool = require('../db');
const PaymentDTO = require('../dtos/PaymentDTO');

async function getAllPayments() {
  const { rows } = await pool.query(
    'SELECT * FROM payments ORDER BY date DESC'
  );
  return rows.map(PaymentDTO.fromRow);
}
async function getPaymentById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM payments WHERE id = $1', [id]
  );
  return rows[0] ? PaymentDTO.fromRow(rows[0]) : null;
}
async function createPayment(data) {
  const { studentId, groupId, amount, date, status } = data;
  const { rows } = await pool.query(
    `INSERT INTO payments
      (student_id, group_id, amount, date, status)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [studentId, groupId, amount, date, status]
  );
  return PaymentDTO.fromRow(rows[0]);
}
async function updatePayment(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(data)) {
    const col = mapToColumn(key);
    fields.push(`${col} = $${idx}`);
    values.push(val);
    idx++;
  }
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE payments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? PaymentDTO.fromRow(rows[0]) : null;
}
async function deletePayment(id) {
  await pool.query('DELETE FROM payments WHERE id = $1', [id]);
}

function mapToColumn(field) {
  const map = {
    studentId: 'student_id',
    groupId: 'group_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  };
  return map[field] || field;
}

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};
