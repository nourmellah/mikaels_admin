const express       = require('express');
const router        = express.Router();
const paymentService = require('../services/paymentService');

// GET /payments?registration_id=…
router.get('/', async (req, res, next) => {
  try {
    const { registration_id: registrationId } = req.query;
    const payments = registrationId
      ? await paymentService.listPaymentsForRegistration(registrationId)
      : await paymentService.getAllPayments();
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

// GET /payments/:id
router.get('/:id', async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Not found' });
    res.json(payment);
  } catch (err) {
    next(err);
  }
});

// POST /payments
router.post('/', async (req, res, next) => {
  try {
    const {
      registration_id: registrationId,
      amount,
      date       = null,
      is_paid    = true
    } = req.body;

    const created = await paymentService.addPayment({
      registrationId,
      amount,
      date,
      isPaid: is_paid
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /payments/:id
router.put('/:id', async (req, res, next) => {
  try {
    const {
      registration_id: registrationId,
      amount,
      date,
      is_paid: isPaid
    } = req.body;

    const updated = await paymentService.updatePayment(
      req.params.id,
      { registrationId, amount, date, isPaid }
    );

    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /payments/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await paymentService.deletePayment(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
