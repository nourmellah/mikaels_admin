const pool = require('../db');
const RegistrationDTO = require('../dtos/RegistrationDTO');
const StudentPaymentSummaryDTO = require('../dtos/StudentPaymentSummaryDTO');

async function getAllRegistrations(filter = {}) {
  let sql = 'SELECT * FROM registrations';
  const clauses = [];
  const params = [];

  if (filter.studentId) {
    params.push(filter.studentId);
    clauses.push(`student_id = $${params.length}`);
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
  return rows.map(RegistrationDTO.fromRow);
}

/**
 * Fetch the payment summary for one student in one group
 * (uses student_payments_per_group view).
 */
async function getStudentPaymentSummary(studentId, groupId) {
  const { rows } = await pool.query(
    'SELECT * FROM student_payments_per_group WHERE student_id = $1 AND group_id = $2',
    [studentId, groupId]
  );
  if (!rows[0]) return null;
  return StudentPaymentSummaryDTO.fromRow(rows[0]);
}


async function getRegistrationById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM registrations WHERE id = $1',
    [id]
  );
  return rows[0] ? RegistrationDTO.fromRow(rows[0]) : null;
}

async function createRegistration(data) {
  const {
    studentId,
    groupId,
    agreedPrice,
    depositPct,
    discountAmount,
    status
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO registrations
       (student_id, group_id, agreed_price, deposit_pct, discount_amount, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [studentId, groupId, agreedPrice, depositPct, discountAmount, status]
  );
  return RegistrationDTO.fromRow(rows[0]);
}

async function updateRegistration(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  const map = {
    studentId:       'student_id',
    groupId:         'group_id',
    agreedPrice:     'agreed_price',
    depositPct:      'deposit_pct',
    discountAmount:  'discount_amount',
    status:          'status'
  };

  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || !(key in map)) continue;
    fields.push(`${map[key]} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return getRegistrationById(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE registrations
        SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *`,
    values
  );
  return rows[0] ? RegistrationDTO.fromRow(rows[0]) : null;
}

async function deleteRegistration(id) {
  await pool.query(
    'DELETE FROM registrations WHERE id = $1',
    [id]
  );
}

module.exports = {
  getAllRegistrations,
  getRegistrationById,
  getStudentPaymentSummary,
  createRegistration,
  updateRegistration,
  deleteRegistration
};
