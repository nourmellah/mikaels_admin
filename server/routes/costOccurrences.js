const express = require('express');
const router = express.Router({ mergeParams: true });
const occService = require('../services/costOccurrenceService');

// GET /costs/:costId/occurrences
router.get('/', async (req, res, next) => {
  try {
    const occs = await occService.getAllOccurrences(req.params.costId);
    res.json(occs);
  } catch (err) { next(err); }
});

// GET /costs/:costId/occurrences/:id
router.get('/:id', async (req, res, next) => {
  try {
    const occ = await occService.getOccurrenceById(req.params.id);
    if (!occ) return res.status(404).json({ message: 'Occurrence not found' });
    res.json(occ);
  } catch (err) { next(err); }
});

// POST /costs/:costId/occurrences
router.post('/', async (req, res, next) => {
  try {
    const payload = { ...req.body, costId: req.params.costId };
    const newOcc = await occService.createOccurrence(payload);
    res.status(201).json(newOcc);
  } catch (err) { next(err); }
});

// PUT /costs/:costId/occurrences/:id
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await occService.updateOccurrence(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Occurrence not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /costs/:costId/occurrences/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await occService.deleteOccurrence(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
