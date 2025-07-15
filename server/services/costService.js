const pool = require('../db');
const CostDTO = require('../dtos/CostDTO');

async function getAllCosts() {
  const { rows } = await pool.query('SELECT * FROM costs ORDER BY created_at');
  return rows.map(CostDTO.fromRow);
}

async function getCostById(id) {
  const { rows } = await pool.query('SELECT * FROM costs WHERE id = $1', [id]);
  return rows[0] ? CostDTO.fromRow(rows[0]) : null;
}

async function createCost(data) {
  const { name, description, type, amount, frequency, startDate, nextDueDate, paid } = data;
  const { rows } = await pool.query(
    `INSERT INTO costs
      (name, description, type, amount, frequency, start_date, next_due_date, paid)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [name, description, type, amount, frequency, startDate, nextDueDate, paid]
  );
  return CostDTO.fromRow(rows[0]);
}

async function updateCost(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  const map = {
    name: 'name',
    description: 'description',
    type: 'type',
    amount: 'amount',
    frequency: 'frequency',
    startDate: 'start_date',
    nextDueDate: 'next_due_date',
    paid: 'paid',
  };
  for (const [key, val] of Object.entries(data)) {
    if (!(key in map)) continue;
    fields.push(`${map[key]} = $${idx}`);
    values.push(val);
    idx++;
  }
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE costs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? CostDTO.fromRow(rows[0]) : null;
}

async function deleteCost(id) {
  await pool.query('DELETE FROM costs WHERE id = $1', [id]);
}

module.exports = {
  getAllCosts,
  getCostById,
  createCost,
  updateCost,
  deleteCost
};

