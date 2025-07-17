const express = require('express');
const router  = express.Router();
const paymentService  = require('../services/paymentService');

// GET /payments
router.get('/', async (req, res, next) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (err) { next(err); }
});

// GET /payments/:id
router.get('/:id', async (req, res, next) => {
  try {
    const p = await paymentService.getPaymentById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) { next(err); }
});

// GET /payments/registration/:registrationId
router.get('/registration/:registrationId', async (req, res, next) => {
  try {
    const payments = await paymentService.listPaymentsForRegistration(req.params.registrationId);
    res.json(payments);
  } catch (err) { next(err); }
});

// POST /payments
router.post('/', async (req, res, next) => {
  try {
    const created = await paymentService.addPayment(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// PUT /payments/:id
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await paymentService.updatePayment(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /payments/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await paymentService.deletePayment(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
