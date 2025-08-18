const express = require('express');
const router  = express.Router();
const dashboardServices = require('../services/dashboardServices');

router.get('/', async (req, res, next) => {
  try {
    const payload = await dashboardServices.getDashboardOverview();
    res.json(payload);
  } catch (err) { next(err); }
});

router.get('/timeseries', async (req, res, next) => {
  try {
    const data = await dashboardServices.getDashboardTimeseries();
    res.json({ data });
  } catch (err) { next(err); }
});

module.exports = router;
