const pool = require('../db');
const GroupSessionDTO = require('../dtos/GroupSessionDTO');
const GroupScheduleDTO = require('../dtos/GroupScheduleDTO');

/** Fetch all sessions */
async function getAllSessions() {
  const { rows } = await pool.query(
    'SELECT * FROM group_sessions ORDER BY session_date, start_time'
  );
  return rows.map(GroupSessionDTO.fromRow);
}

/** Fetch session by ID */
async function getSessionById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM group_sessions WHERE id = $1',
    [id]
  );
  return rows[0] ? GroupSessionDTO.fromRow(rows[0]) : null;
}

/** Fetch sessions for a given group */
async function getSessionsByGroup(groupId) {
  const { rows } = await pool.query(
    'SELECT * FROM group_sessions WHERE group_id = $1 ORDER BY session_date, start_time',
    [groupId]
  );
  return rows.map(GroupSessionDTO.fromRow);
}

/** Create a single session */
async function createSession(data) {
  const { groupId, sessionDate, startTime, endTime, isMakeup, status } = data;
  const { rows } = await pool.query(
    `INSERT INTO group_sessions
      (group_id, session_date, start_time, end_time, is_makeup, status)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [groupId, sessionDate, startTime, endTime, isMakeup || false, status || 'PENDING']
  );
  return GroupSessionDTO.fromRow(rows[0]);
}

/** Update an existing session */
async function updateSession(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(data)) {
    // convert camelCase to snake_case
    const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    fields.push(`${col} = $${idx++}`);
    values.push(val);
  }
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE group_sessions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ? GroupSessionDTO.fromRow(rows[0]) : null;
}

/** Delete a session */
async function deleteSession(id) {
  await pool.query('DELETE FROM group_sessions WHERE id = $1', [id]);
}

/**
 * Generate sessions for a week starting at weekStart (ISO date string YYYY-MM-DD).
 * Inserts sessions for each group_schedule where the scheduled date/time has passed.
 */
async function generateSessionsForWeek(weekStart) {
  // load schedules
  const schedRes = await pool.query('SELECT * FROM group_schedules');
  const schedules = schedRes.rows.map(GroupScheduleDTO.fromRow);
  // iterate schedules
  const created = [];
  const now = new Date();
  for (const s of schedules) {
    // compute date for this week's schedule
    const d = new Date(weekStart);
    d.setDate(d.getDate() + s.dayOfWeek);
    const [eh, em] = s.endTime.split(':').map(Number);
    const sessionEnd = new Date(d);
    sessionEnd.setHours(eh, em, 0, 0);
    // only past sessions
    if (sessionEnd > now) continue;
    const sessionDate = d.toISOString().split('T')[0];
    // check uniqueness
    const existsRes = await pool.query(
      `SELECT 1 FROM group_sessions
       WHERE group_id=$1 AND session_date=$2 AND start_time=$3 AND end_time=$4`,
      [s.groupId, sessionDate, s.startTime, s.endTime]
    );
    if (existsRes.rowCount) continue;
    // insert
    const { rows } = await pool.query(
      `INSERT INTO group_sessions
        (group_id, session_date, start_time, end_time, is_makeup, status)
       VALUES ($1,$2,$3,$4,false,'PENDING')
       RETURNING *`,
      [s.groupId, sessionDate, s.startTime, s.endTime]
    );
    created.push(GroupSessionDTO.fromRow(rows[0]));
  }
  return created;
}

module.exports = {
  getAllSessions,
  getSessionById,
  getSessionsByGroup,
  createSession,
  updateSession,
  deleteSession,
  generateSessionsForWeek,
};
