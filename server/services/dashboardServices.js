const pool = require('../db');

async function getDashboardOverview() {
  // mirrors your current route, just moved here
  const metrics = await pool.query('SELECT * FROM dashboard_metrics;');
  const sessions = await pool.query('SELECT * FROM dashboard_sessions_today;');
  return {
    metrics: metrics.rows[0],
    sessions: sessions.rows,
  };
}

async function getDashboardTimeseries() {
  const { rows } = await pool.query(`
    SELECT
      month,
      month_start,
      payments_paid,
      costs_paid,
      teacher_paid,
      costs_total,
      profit
    FROM dashboard_timeseries_12mo
    ORDER BY month_start
  `);
  return rows;
}

module.exports = {
  getDashboardOverview,
  getDashboardTimeseries,
};
