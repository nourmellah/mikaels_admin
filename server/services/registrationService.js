const pool = require('../db');
const RegistrationDTO = require('../dtos/RegistrationDTO');

/**
 * Fetch all registrations, ordered by creation time.
 */
async function getAllRegistrations() {
  const { rows } = await pool.query(
    'SELECT * FROM registrations ORDER BY created_at'
  );
  return rows.map(RegistrationDTO.fromRow);
}

/**
 * Fetch a single registration by its ID.
 */
async function getRegistrationById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM registrations WHERE id = $1',
    [id]
  );
  return rows[0] ? RegistrationDTO.fromRow(rows[0]) : null;
}

/**
 * Create a new registration.
 * Automatically enforces UNIQUE(student_id, group_id).
 */
async function createRegistration(data) {
  const {
    studentId,
    groupId,
    agreedPrice,
    depositPct,
    discountAmount,
    registrationDate,
    status
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO registrations
      (student_id, group_id, agreed_price, deposit_pct, discount_amount, registration_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [studentId, groupId, agreedPrice, depositPct, discountAmount, registrationDate, status]
  );
  return RegistrationDTO.fromRow(rows[0]);
}

/**
 * Update fields on an existing registration.
 */
async function updateRegistration(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, val] of Object.entries(data)) {
    // map JS camelCase to SQL snake_case
    const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    fields.push(`${col} = $${idx}`);
    values.push(val);
    idx++;
  }
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE registrations SET ${fields.join(', ')}
     WHERE id = $${idx}
     RETURNING *`,
    values
  );
  return rows[0] ? RegistrationDTO.fromRow(rows[0]) : null;
}

/**
 * Delete a registration (cascades to payments).
 */
async function deleteRegistration(id) {
  await pool.query('DELETE FROM registrations WHERE id = $1', [id]);
}

module.exports = {
  getAllRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration
};
