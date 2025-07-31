const pool = require('../db');
const TeacherPaymentDTO = require('../dtos/TeacherPaymentDTO');

async function getAllTeacherPayments(filter = {}) {
  let sql = 'SELECT * FROM teacher_payments';
  const clauses = [];
  const params = [];

  if (filter.teacherId) {
    params.push(filter.teacherId);
    clauses.push(`teacher_id = $${params.length}`);
  }
  if (filter.groupId) {
    params.push(filter.groupId);
    clauses.push(`group_id = $${params.length}`);
  }
  if (clauses.length) {
    sql += ' WHERE ' + clauses.join(' AND ');
  }
  sql += ' ORDER BY created_at';

  const { rows } = await pool.query(sql, params);
  return rows.map(TeacherPaymentDTO.fromRow);
}

async function getTeacherPaymentById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM teacher_payments WHERE id = $1',
    [id]
  );
  return rows[0] ? TeacherPaymentDTO.fromRow(rows[0]) : null;
}

/**
 * Returns one row per group that this teacher taught, including:
 * - total_hours
 * - rate
 * - amount_due      (hours * rate)
 * - paid_amount     (sum of actual payments)
 * - unpaid_amount   (difference)
 */
async function getTeacherDues(teacherId) {
  const sql = `
    SELECT
      td.teacher_id,
      td.group_id,
      g.name          AS group_name,
      td.total_hours,
      td.rate,
      td.amount_due,
      COALESCE(p.paid_amount, 0)::NUMERIC(10,3) AS paid_amount,
      (td.amount_due - COALESCE(p.paid_amount, 0))::NUMERIC(10,3) AS unpaid_amount
    FROM teacher_group_dues td
    JOIN groups g
      ON td.group_id = g.id
    LEFT JOIN (
      SELECT
        teacher_id,
        group_id,
        SUM(amount)::NUMERIC(10,3) AS paid_amount
      FROM teacher_payments
      WHERE paid = TRUE
      GROUP BY teacher_id, group_id
    ) p
      ON p.teacher_id = td.teacher_id
     AND p.group_id   = td.group_id
    WHERE td.teacher_id = $1
    ORDER BY td.group_id;
  `;
  const { rows } = await pool.query(sql, [teacherId]);
  return rows;
}

async function addTeacherPayment(data) {
  const {
    teacherId,
    groupId,
    totalHours,
    rate,
    amount,
    paid        = false,
    paidDate    = null
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO teacher_payments
       (teacher_id, group_id, total_hours, rate, amount, paid, paid_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [teacherId, groupId, totalHours, rate, amount, paid, paidDate]
  );
  return TeacherPaymentDTO.fromRow(rows[0]);
}

async function updateTeacherPayment(id, data) {
  const fields = [];
  const values = [];
  let   idx = 1;
  const map = {
    teacherId:  'teacher_id',
    groupId:    'group_id',
    totalHours: 'total_hours',
    rate:       'rate',
    amount:     'amount',
    paid:       'paid',
    paidDate:   'paid_date'
  };

  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || !(key in map)) continue;
    fields.push(`${map[key]} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return getTeacherPaymentById(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE teacher_payments
        SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *`,
    values
  );
  return rows[0] ? TeacherPaymentDTO.fromRow(rows[0]) : null;
}

async function deleteTeacherPayment(id) {
  await pool.query(
    'DELETE FROM teacher_payments WHERE id = $1',
    [id]
  );
}

module.exports = {
  getAllTeacherPayments,
  getTeacherPaymentById,
  getTeacherDues,
  addTeacherPayment,
  updateTeacherPayment,
  deleteTeacherPayment
};
