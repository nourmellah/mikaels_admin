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

async function getActiveGroupsByMonth(month) {
  // Accept ?month=YYYY-MM or any parseable date; normalize to first-of-month
  let paramDate = null;
  if (month) paramDate = /^\d{4}-\d{2}$/.test(month) ? `${month}-01` : month;

  const where =
    paramDate ? "WHERE gam.month_start = date_trunc('month', $1::date)::date" : "";

  const { rows } = await pool.query(
    `
    WITH gam AS (
      SELECT month_start, group_id
      FROM group_active_months
      ${where}
    )
    SELECT
      gam.month_start,
      json_agg(
        json_build_object('id', g.id, 'name', g.name)
        ORDER BY g.name
      ) AS groups
    FROM gam
    JOIN groups g ON g.id = gam.group_id
    GROUP BY gam.month_start
    ORDER BY gam.month_start;
    `,
    paramDate ? [paramDate] : []
  );

  // If a single month was requested, return one object (or null)
  return month ? (rows[0] || null) : rows;
}

module.exports = {
  getAllGroups,
  getGroupById,
  getGroupCostSummary,
  createGroup,
  updateGroup,
  deleteGroup,
  getActiveGroupsByMonth
};