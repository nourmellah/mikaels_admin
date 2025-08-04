const express = require('express');
const router = express.Router();
const registrationService = require('../services/registrationService');

// GET /registrations
router.get('/', async (req, res, next) => {
  try {
    const { student_id: studentId, group_id: groupId } = req.query;
    const regs = await registrationService.getAllRegistrations({ studentId, groupId });
    res.json(regs);
  } catch (err) {
    next(err);
  }
});

// GET /registrations/summary?student_id=<>&group_id=<>
router.get('/summary', async (req, res, next) => {
  try {
    const { student_id: studentId, group_id: groupId, reg_id: regId } = req.query;
    let summary;

    if (regId) {
      summary = await registrationService.getRegistrationPaymentSummaryById(regId);
    } else {
      summary = await registrationService.getStudentPaymentSummary(studentId, groupId);
    }

    if (!summary) {
      return res.status(404).json({ message: 'Payment summary not found' });
    }
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /registrations/:id
router.get('/:id', async (req, res, next) => {
  try {
    const reg = await registrationService.getRegistrationById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Not found' });
    res.json(reg);
  } catch (err) {
    next(err);
  }
});

// POST /registrations
router.post('/', async (req, res, next) => {
  try {
    const created = await registrationService.createRegistration(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /registrations/:id
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await registrationService.updateRegistration(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /registrations/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await registrationService.deleteRegistration(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
