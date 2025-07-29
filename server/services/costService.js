const pool = require('../db');
const CostDTO = require('../dtos/CostDTO');

async function getAllCosts() {
  const { rows } = await pool.query(
    'SELECT * FROM costs ORDER BY created_at'
  );
  return rows.map(CostDTO.fromRow);
}

async function getCostById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM costs WHERE id = $1',
    [id]
  );
  return rows[0] ? CostDTO.fromRow(rows[0]) : null;
}

async function createCost(data) {
  const {
    costTemplateId,
    name,
    dueDate,
    amount,
    paid = false,
    paidDate = null,
    notes = null,
    groupId = null           // ← new
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO costs
       (cost_template_id, name, due_date, amount, paid, paid_date, notes, group_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [costTemplateId, name, dueDate, amount, paid, paidDate, notes, groupId]
  );

  return CostDTO.fromRow(rows[0]);
}


async function updateCost(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  const map = {
    costTemplateId: 'cost_template_id',
    name:           'name',
    dueDate:        'due_date',
    amount:         'amount',
    paid:           'paid',
    paidDate:       'paid_date',
    notes:          'notes',
    groupId:        'group_id'
  };

  for (const [key, val] of Object.entries(data)) {
    if (!(key in map)) continue;
    fields.push(`${map[key]} = $${idx}`);
    values.push(val);
    idx++;
  }

  if (fields.length === 0) {
    return getCostById(id);
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