const pool = require('../db');
const StudentDTO = require('../dtos/StudentDTO');

async function getAllStudents() {
  const { rows } = await pool.query(
    'SELECT * FROM students ORDER BY last_name, first_name'
  );
  return rows.map(StudentDTO.fromRow);
}
async function getStudentById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM students WHERE id = $1', [id]
  );
  return rows[0] ? StudentDTO.fromRow(rows[0]) : null;
}
async function createStudent(data) {
  const { firstName, lastName, email, phone, groupId, level, hasCv, imageUrl } = data;
  const { rows } = await pool.query(
    `INSERT INTO students
      (first_name, last_name, email, phone, group_id, level, has_cv, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [firstName, lastName, email, phone, groupId, level, hasCv, imageUrl]
  );
  return StudentDTO.fromRow(rows[0]);
}
async function updateStudent(id, data) {
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
    `UPDATE students SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? StudentDTO.fromRow(rows[0]) : null;
}
async function deleteStudent(id) {
  await pool.query('DELETE FROM students WHERE id = $1', [id]);
}

function mapToColumn(field) {
  const map = {
    firstName: 'first_name',
    lastName: 'last_name',
    groupId: 'group_id',
    hasCv: 'has_cv',
    imageUrl: 'image_url',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  };
  return map[field] || field;
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
