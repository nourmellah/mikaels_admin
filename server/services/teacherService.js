const pool = require('../db');
const TeacherDTO = require('../dtos/TeacherDTO');

async function getAllTeachers() {
  const { rows } = await pool.query(
    'SELECT * FROM teachers ORDER BY last_name, first_name'
  );
  return rows.map(TeacherDTO.fromRow);
}
async function getTeacherById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM teachers WHERE id = $1', [id]
  );
  return rows[0] ? TeacherDTO.fromRow(rows[0]) : null;
}
async function createTeacher(data) {
  const { firstName, lastName, email, phone, salary, imageUrl } = data;
  const { rows } = await pool.query(
    `INSERT INTO teachers
      (first_name, last_name, email, phone, salary, image_url)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [firstName, lastName, email, phone, salary, imageUrl]
  );
  return TeacherDTO.fromRow(rows[0]);
}
async function updateTeacher(id, data) {
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
    `UPDATE teachers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? TeacherDTO.fromRow(rows[0]) : null;
}
async function deleteTeacher(id) {
  await pool.query('DELETE FROM teachers WHERE id = $1', [id]);
}

function mapToColumn(field) {
  const map = {
    firstName: 'first_name',
    lastName: 'last_name',
    imageUrl: 'image_url',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  };
  return map[field] || field;
}

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
