const express = require('express');
const router = express.Router();
const svc = require('../services/groupScheduleService');

// GET /group-schedules
router.get('/', async (req, res, next) => {
  try {
    const schedules = await svc.getAllSchedules();
    res.json(schedules);
  } catch (err) { next(err); }
});

// GET /group-schedules/:id
router.get('/:id', async (req, res, next) => {
  try {
    const sched = await svc.getScheduleById(req.params.id);
    if (!sched) return res.status(404).json({ message: 'Not found' });
    res.json(sched);
  } catch (err) { next(err); }
});

// GET /groups/:groupId/schedules
router.get('/group/:groupId', async (req, res, next) => {
  try {
    const list = await svc.getSchedulesByGroup(req.params.groupId);
    res.json(list);
  } catch (err) { next(err); }
});

// POST /group-schedules
router.post('/', async (req, res, next) => {
  try {
    const created = await svc.createSchedule(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// PUT /group-schedules/:id
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await svc.updateSchedule(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /group-schedules/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteSchedule(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
