const express = require('express');
const router = express.Router();
const studentService = require('../services/studentService');
const removeFile = require('../utils/removeFile')


// GET /students - list all students
router.get('/', async (req, res, next) => {
  try {
    const students = await studentService.getAllStudents();
    res.json(students);
  } catch (err) {
    next(err);
  }
});

// GET /students/:id - retrieve one student
router.get('/:id', async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) return res.sendStatus(404);
    res.json(student);
  } catch (err) {
    next(err);
  }
});

// POST /students
router.post('/', async (req, res, next) => {
  try {
    let { firstName, lastName, email, phone, groupId, level, hasCv, imageUrl } = req.body;

    // basic server‐side validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'firstName, lastName and email are required' });
    }

    current = await studentService.getStudentById(req.params.id);
    if (imageUrl && current?.imageUrl && imageUrl !== current.imageUrl) {
      removeFile(current.imageUrl); // quiet no-op if not found
    }

    // allow "no group" by converting empty string to null
    groupId = groupId ? groupId : null;

    const student = await studentService.createStudent({
      firstName,
      lastName,
      email,
      phone: phone || null,
      groupId,
      level: level || null,
      hasCv: hasCv === true || hasCv === 'true',
      imageUrl: imageUrl || null
    });

    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


// PUT /students/:id - update existing student (JSON payload)
router.put('/:id', async (req, res, next) => {
  try {
    const data = { ...req.body };
    // image updating to be added later
    const updated = await studentService.updateStudent(req.params.id, data);
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /students/:id - delete a student
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const existing = await studentService.getStudentById(id);
    if (!existing) return res.sendStatus(404);

    removeFile(existing.photoUrl);

    await studentService.deleteStudent(id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// Wallet: get balance + last transactions
router.get('/:id/wallet', async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) return res.sendStatus(404);
    const wallet = await studentService.getWallet(req.params.id, Number(req.query.limit) || 20);
    res.json(wallet);
  } catch (err) { next(err); }
});

// Wallet: deposit credit
router.post('/:id/wallet/deposit', async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }
    const student = await studentService.getStudentById(req.params.id);
    if (!student) return res.sendStatus(404);
    await studentService.depositToWallet(req.params.id, amount, note);
    const wallet = await studentService.getWallet(req.params.id, 10);
    res.status(201).json(wallet);
  } catch (err) { next(err); }
});

// Wallet: apply credit to a registration (creates a normal payment row)
router.post('/:id/wallet/apply', async (req, res, next) => {
  try {
    const { registrationId, amount, note } = req.body;
    if (!registrationId) return res.status(400).json({ message: 'registrationId is required' });
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }
    const student = await studentService.getStudentById(req.params.id);
    if (!student) return res.sendStatus(404);

    const result = await studentService.applyWalletToRegistration(req.params.id, registrationId, amount, note);
    res.status(201).json(result); // { balance }
  } catch (err) { next(err); }
});

module.exports = router;