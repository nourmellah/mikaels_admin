const pool = require('../db');
const CostTemplateDTO = require('../dtos/CostTemplateDTO');

async function getAllTemplates() {
  const { rows } = await pool.query(
    'SELECT * FROM cost_templates ORDER BY created_at'
  );
  return rows.map(CostTemplateDTO.fromRow);
}

async function getTemplateById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM cost_templates WHERE id = $1',
    [id]
  );
  return rows[0] ? CostTemplateDTO.fromRow(rows[0]) : null;
}

async function createTemplate(data) {
  const {
    name,
    frequency,
    amount,
    notes     = null,
    groupId   = null
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO cost_templates
       (name, frequency, amount, notes, group_id)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [name, frequency, amount, notes, groupId]
  );

  return CostTemplateDTO.fromRow(rows[0]);
}


async function updateTemplate(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  const map = {
    name: 'name',
    frequency: 'frequency',
    amount: 'amount',
    notes: 'notes',
    groupId:   'group_id' 
  };

  for (const [key, val] of Object.entries(data)) {
    if (!(key in map)) continue;
    fields.push(`${map[key]} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) {
    return getTemplateById(id);
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE cost_templates SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? CostTemplateDTO.fromRow(rows[0]) : null;
}

async function deleteTemplate(id) {
  await pool.query('DELETE FROM cost_templates WHERE id = $1', [id]);
}

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};