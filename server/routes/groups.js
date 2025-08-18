const express = require('express');
const router = express.Router();
const groupService = require('../services/groupService');

// GET /groups - list all groups
router.get('/', async (req, res, next) => {
  try {
    const groups = await groupService.getAllGroups();
    res.json(groups);
  } catch (err) {
    next(err);
  }
});

// GET /groups/active - list groups active per month
router.get('/active', async (req, res, next) => {
  try {
    const { month } = req.query; // optional: YYYY-MM or any date string
    const data = await groupService.getActiveGroupsByMonth(month);
    if (month && !data) {
      return res.status(404).json({ message: 'No data for the requested month' });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});


// GET /groups/:id - get a single group by ID
router.get('/:id', async (req, res, next) => {
  try {
    const group = await groupService.getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (err) {
    next(err);
  }
});

// GET /groups/:id/summary
router.get('/:id/summary', async (req, res, next) => {
  try {
    const summary = await groupService.getGroupCostSummary(req.params.id);
    if (!summary) {
      return res.status(404).json({ message: 'Cost summary not found' });
    }
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// POST /groups - create a new group
router.post('/', async (req, res, next) => {
  try {
    const newGroup = await groupService.createGroup(req.body);
    res.status(201).json(newGroup);
  } catch (err) {
    next(err);
  }
});

// PUT /groups/:id - update an existing group
router.put('/:id', async (req, res, next) => {
  try {
    const updatedGroup = await groupService.updateGroup(req.params.id, req.body);
    if (!updatedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(updatedGroup);
  } catch (err) {
    next(err);
  }
});

// DELETE /groups/:id - delete a group
router.delete('/:id', async (req, res, next) => {
  try {
    await groupService.deleteGroup(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
