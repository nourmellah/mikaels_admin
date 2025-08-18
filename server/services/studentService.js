// services/studentService.js
const pool = require('../db');
const StudentDTO = require('../dtos/StudentDTO');

// --- READS now include wallet_balance ---
async function getAllStudents() {
  const { rows } = await pool.query(
    `SELECT s.*, COALESCE(w.balance,0) AS wallet_balance
       FROM students s
       LEFT JOIN student_wallets w ON w.student_id = s.id
      ORDER BY s.last_name, s.first_name`
  );
  return rows.map(StudentDTO.fromRow);
}

async function getStudentById(id) {
  const { rows } = await pool.query(
    `SELECT s.*, COALESCE(w.balance,0) AS wallet_balance
       FROM students s
       LEFT JOIN student_wallets w ON w.student_id = s.id
      WHERE s.id = $1`,
    [id]
  );
  return rows[0] ? StudentDTO.fromRow(rows[0]) : null;
}

// --- CREATE student + wallet row (transaction) ---
async function createStudent(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { firstName, lastName, email, phone, groupId, level, hasCv, imageUrl } = data;
    const ins = await client.query(
      `INSERT INTO students
        (first_name, last_name, email, phone, group_id, level, has_cv, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [firstName, lastName, email, phone, groupId, level, hasCv, imageUrl]
    );
    const student = ins.rows[0];

    await client.query(
      `INSERT INTO student_wallets (student_id, balance) VALUES ($1, 0)
       ON CONFLICT (student_id) DO NOTHING`,
      [student.id]
    );

    // include wallet_balance in response
    const { rows } = await client.query(
      `SELECT s.*, COALESCE(w.balance,0) AS wallet_balance
         FROM students s
         LEFT JOIN student_wallets w ON w.student_id = s.id
        WHERE s.id = $1`,
      [student.id]
    );

    await client.query('COMMIT');
    return StudentDTO.fromRow(rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// --- UPDATE as-is (no wallet direct edits) ---
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
  if (!rows[0]) return null;

  const out = await pool.query(
    `SELECT s.*, COALESCE(w.balance,0) AS wallet_balance
       FROM students s LEFT JOIN student_wallets w ON w.student_id = s.id
      WHERE s.id = $1`,
    [id]
  );
  return out.rows[0] ? StudentDTO.fromRow(out.rows[0]) : null;
}

async function deleteStudent(id) {
  await pool.query('DELETE FROM students WHERE id = $1', [id]);
}

// --- Wallet helpers ---
async function getWallet(studentId, limit = 20) {
  const [{ rows: balRows }, { rows: txRows }] = await Promise.all([
    pool.query(`SELECT COALESCE(balance,0) AS balance FROM student_wallets WHERE student_id = $1`, [studentId]),
    pool.query(
      `SELECT id, amount, kind, related_registration_id, note, created_at
         FROM student_wallet_transactions
        WHERE student_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
      [studentId, limit]
    ),
  ]);
  return {
    balance: balRows[0]?.balance ?? 0,
    transactions: txRows
  };
}

// --- Wallet helpers ---

async function depositToWallet(studentId, amount, note) {
  if (amount <= 0) throw new Error('Amount must be > 0');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure the wallet row exists for this student
    await client.query(
      `INSERT INTO student_wallets (student_id, balance)
       VALUES ($1, 0)
       ON CONFLICT (student_id) DO NOTHING`,
      [studentId]
    );

    // Update the wallet balance
    await client.query(
      `UPDATE student_wallets
       SET balance = balance + $2
       WHERE student_id = $1`,
      [studentId, amount]
    );

    const { rows } = await client.query(
      `INSERT INTO student_wallet_transactions (student_id, amount, kind, note)
       VALUES ($1, $2, 'DEPOSIT', $3)
       RETURNING id, created_at`,
      [studentId, amount, note ?? null]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function applyWalletToRegistration(studentId, registrationId, amount, note) {
  if (amount <= 0) throw new Error('Amount must be > 0');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure the wallet row exists (legacy students)
    await client.query(
      `INSERT INTO student_wallets (student_id, balance)
       VALUES ($1, 0)
       ON CONFLICT (student_id) DO NOTHING`,
      [studentId]
    );

    // Lock balance to avoid races
    const balRes = await client.query(
      `SELECT balance FROM student_wallets WHERE student_id = $1 FOR UPDATE`,
      [studentId]
    );
    const bal = balRes.rows[0]?.balance ?? 0;
    if (bal < amount) throw new Error('Insufficient wallet balance');

    // 1) Ledger: record application as a negative movement
    await client.query(
      `INSERT INTO student_wallet_transactions
         (student_id, amount, kind, related_registration_id, note)
       VALUES ($1, $2, 'APPLY_TO_REGISTRATION', $3, $4)`,
      [studentId, -amount, registrationId, note ?? null]
    );

    // 2) Reflect as a normal paid payment (use correct column name "date")
    await client.query(
      `INSERT INTO payments (registration_id, amount, "date", is_paid)
       VALUES ($1, $2, CURRENT_DATE, true)`,
      [registrationId, amount]
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  // Return updated balance
  const { rows } = await pool.query(
    `SELECT balance FROM student_wallets WHERE student_id = $1`,
    [studentId]
  );
  return { balance: rows[0]?.balance ?? 0 };
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
  deleteStudent,
  // wallet
  getWallet,
  depositToWallet,
  applyWalletToRegistration
};
