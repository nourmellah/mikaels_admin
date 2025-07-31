const pool = require('../db');
const GroupDTO = require('../dtos/GroupDTO');

async function getAllGroups() {
  const { rows } = await pool.query('SELECT * FROM groups ORDER BY created_at');
  return rows.map(GroupDTO.fromRow);
}
async function getGroupById(id) {
  const { rows } = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
  return rows[0] ? GroupDTO.fromRow(rows[0]) : null;
}

/**
 * Fetch the aggregated cost summary for a single group.
 */
async function getGroupCostSummary(groupId) {
  const { rows } = await pool.query(
    'SELECT * FROM group_cost_summary WHERE group_id = $1',
    [groupId]
  );
  return rows[0] || null;
}

async function createGroup(data) {
  const { name, level, startDate, endDate, weeklyHours, totalHours, price, teacherId, imageUrl } = data;
  const { rows } = await pool.query(
    `INSERT INTO groups
       (name, level, start_date, end_date, weekly_hours, total_hours, price, teacher_id, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, level, startDate, endDate, weeklyHours, totalHours, price, teacherId, imageUrl]
  );
  return GroupDTO.fromRow(rows[0]);
}

async function updateGroup(id, data) {
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
    `UPDATE groups SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? GroupDTO.fromRow(rows[0]) : null;
}

async function deleteGroup(id) {
  await pool.query('DELETE FROM groups WHERE id = $1', [id]);
}

function mapToColumn(field) {
  const map = {
    startDate: 'start_date',
    endDate: 'end_date',
    weeklyHours: 'weekly_hours',
    totalHours: 'total_hours',
    price: 'price',
    teacherId: 'teacher_id',
    imageUrl: 'image_url',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  };
  return map[field] || field;
}

module.exports = {
  getAllGroups,
  getGroupById,
  getGroupCostSummary,
  createGroup,
  updateGroup,
  deleteGroup
};