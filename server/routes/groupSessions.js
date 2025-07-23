// src/routes/groupSessions.js
const express = require('express');
const router = express.Router();
const svc = require('../services/groupSessionService');

// GET /group-sessions
router.get('/', async (req, res, next) => {
  try {
    const sessions = await svc.getAllSessions();
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

// GET /group-sessions/:id
router.get('/:id', async (req, res, next) => {
  try {
    const session = await svc.getSessionById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// GET /groups/:groupId/sessions
router.get('/group/:groupId', async (req, res, next) => {
  try {
    const sessions = await svc.getSessionsByGroup(req.params.groupId);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

// POST /group-sessions
router.post('/', async (req, res, next) => {
  try {
    const created = await svc.createSession(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /group-sessions/:id
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await svc.updateSession(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /group-sessions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteSession(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /group-sessions/generate
// Body: { weekStart: 'YYYY-MM-DD' }
router.post('/generate', async (req, res, next) => {
  try {
    const { weekStart } = req.body;
    const created = await svc.generateSessionsForWeek(weekStart);
    res.json(created);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
