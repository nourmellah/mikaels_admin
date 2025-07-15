const pool = require('../db');
const CostOccurrenceDTO = require('../dtos/CostOccurrenceDTO');

async function getAllOccurrences(costId) {
  const { rows } = await pool.query(
    'SELECT * FROM cost_occurrences WHERE cost_id = $1 ORDER BY due_date',
    [costId]
  );
  return rows.map(CostOccurrenceDTO.fromRow);
}

async function getOccurrenceById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM cost_occurrences WHERE id = $1',
    [id]
  );
  return rows[0] ? CostOccurrenceDTO.fromRow(rows[0]) : null;
}

async function createOccurrence(data) {
  const { costId, dueDate, amount, paidDate } = data;
  const { rows } = await pool.query(
    `INSERT INTO cost_occurrences
       (cost_id, due_date, amount, paid_date)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [costId, dueDate, amount, paidDate]
  );
  return CostOccurrenceDTO.fromRow(rows[0]);
}

async function updateOccurrence(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  const map = {
    costId:    'cost_id',
    dueDate:   'due_date',
    amount:    'amount',
    paidDate:  'paid_date'
  };

  for (const [key, val] of Object.entries(data)) {
    if (!(key in map)) continue;
    fields.push(`${map[key]} = $${idx}`);
    values.push(val);
    idx++;
  }
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE cost_occurrences
     SET ${fields.join(', ')}
     WHERE id = $${idx}
     RETURNING *`,
    values
  );
  return rows[0] ? CostOccurrenceDTO.fromRow(rows[0]) : null;
}

async function deleteOccurrence(id) {
  await pool.query('DELETE FROM cost_occurrences WHERE id = $1', [id]);
}

module.exports = {
  getAllOccurrences,
  getOccurrenceById,
  createOccurrence,
  updateOccurrence,
  deleteOccurrence
};
