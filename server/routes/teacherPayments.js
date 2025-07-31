const express = require('express');
const router = express.Router();
const teacherPaymentService = require('../services/teacherPaymentService');

// GET /teacher-payments?teacher_id=…&group_id=…
router.get('/', async (req, res, next) => {
  try {
    const { teacher_id: teacherId, group_id: groupId } = req.query;
    const payments = await teacherPaymentService.getAllTeacherPayments({
      teacherId,
      groupId
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

// GET /teacher-payments/summary?teacher_id=…
router.get('/summary', async (req, res, next) => {
  try {
    const { teacher_id: teacherId } = req.query;
    const summary = await teacherPaymentService.getTeacherDues(teacherId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /teacher-payments/:id
router.get('/:id', async (req, res, next) => {
  try {
    const payment = await teacherPaymentService.getTeacherPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Not found' });
    res.json(payment);
  } catch (err) {
    next(err);
  }
});

// POST /teacher-payments
router.post('/', async (req, res, next) => {
  try {
    const {
      teacher_id: teacherId,
      group_id:   groupId,
      total_hours: totalHours,
      rate,
      amount,
      paid = false,
      paid_date: paidDate = null
    } = req.body;

    const created = await teacherPaymentService.addTeacherPayment({
      teacherId,
      groupId,
      totalHours,
      rate,
      amount,
      paid,
      paidDate
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /teacher-payments/:id
router.put('/:id', async (req, res, next) => {
  try {
    const {
      teacher_id: teacherId,
      group_id:   groupId,
      total_hours: totalHours,
      rate,
      amount,
      paid,
      paid_date: paidDate
    } = req.body;

    const updated = await teacherPaymentService.updateTeacherPayment(
      req.params.id,
      { teacherId, groupId, totalHours, rate, amount, paid, paidDate }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /teacher-payments/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await teacherPaymentService.deleteTeacherPayment(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
