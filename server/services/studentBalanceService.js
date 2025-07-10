const pool = require('../db');
const StudentBalanceDTO = require('../dtos/StudentBalanceDTO');

async function getAllStudentBalances() {
  const { rows } = await pool.query('SELECT * FROM student_balance');
  return rows.map(StudentBalanceDTO.fromRow);
}
async function getBalanceByStudentId(studentId) {
  const { rows } = await pool.query(
    'SELECT * FROM student_balance WHERE student_id = $1', [studentId]
  );
  return rows[0] ? StudentBalanceDTO.fromRow(rows[0]) : null;
}
module.exports = { getAllStudentBalances, getBalanceByStudentId };
