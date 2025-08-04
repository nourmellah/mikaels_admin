const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res, next) => {
  const metrics = await pool.query('SELECT * FROM dashboard_metrics;');
  const sessions = await pool.query('SELECT * FROM dashboard_sessions_today;');
  res.json({
    metrics: metrics.rows[0],
    sessions: sessions.rows
  });
});

module.exports = router;
