const pool = require('../db');
const GroupScheduleDTO = require('../dtos/GroupScheduleDTO');

/** Fetch all schedules for all groups */
async function getAllSchedules() {
  const { rows } = await pool.query(
    'SELECT * FROM group_schedules ORDER BY day_of_week, start_time'
  );
  return rows.map(GroupScheduleDTO.fromRow);
}

/** Fetch a single schedule by its ID */
async function getScheduleById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM group_schedules WHERE id = $1',
    [id]
  );
  return rows[0] ? GroupScheduleDTO.fromRow(rows[0]) : null;
}

/** Fetch all schedules for a given group */
async function getSchedulesByGroup(groupId) {
  const { rows } = await pool.query(
    'SELECT * FROM group_schedules WHERE group_id = $1 ORDER BY day_of_week, start_time',
    [groupId]
  );
  return rows.map(GroupScheduleDTO.fromRow);
}

/** Create a new schedule entry */
async function createSchedule(data) {
  const { groupId, dayOfWeek, startTime, endTime } = data;
  const { rows } = await pool.query(
    `INSERT INTO group_schedules
      (group_id, day_of_week, start_time, end_time)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [groupId, dayOfWeek, startTime, endTime]
  );
  return GroupScheduleDTO.fromRow(rows[0]);
}

/** Update an existing schedule */
async function updateSchedule(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(data)) {
    const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    fields.push(`${col} = $${idx++}`);
    values.push(val);
  }
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE group_schedules SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? GroupScheduleDTO.fromRow(rows[0]) : null;
}

/** Delete a schedule entry */
async function deleteSchedule(id) {
  await pool.query('DELETE FROM group_schedules WHERE id = $1', [id]);
}

module.exports = {
  getAllSchedules,
  getScheduleById,
  getSchedulesByGroup,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
