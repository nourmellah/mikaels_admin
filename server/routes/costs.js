const express = require('express');
const router = express.Router();
const costService = require('../services/costService');

// GET /costs
router.get('/', async (req, res, next) => {
  try {
    const costs = await costService.getAllCosts();
    res.json(costs);
  } catch (err) {
    next(err);
  }
});

// GET /costs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const cost = await costService.getCostById(req.params.id);
    if (!cost) return res.status(404).json({ message: 'Cost not found' });
    res.json(cost);
  } catch (err) {
    next(err);
  }
});

// POST /costs
router.post('/', async (req, res, next) => {
  const { name, due_date, amount, notes, group_id } = req.body;
  const cost = await costService.createCost({
    name,
    due_date,
    amount,
    notes,
    group_id: group_id || null
  });
  res.status(201).json(cost);
});

// PUT /costs/:id
router.put('/:id', async (req, res, next) => {
  const { name, due_date, amount, notes, group_id } = req.body;
  const updated = await costService.updateCost(req.params.id, {
    name,
    due_date,
    amount,
    notes,
    group_id: group_id || null
  });
  res.json(updated);
});


// DELETE /costs/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await costService.deleteCost(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
