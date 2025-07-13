const express = require('express');
const router = express.Router();
const teacherService = require('../services/teacherService');

// GET /teachers - list all teachers
router.get('/', async (req, res, next) => {
  try {
    const teachers = await teacherService.getAllTeachers();
    res.json(teachers);
  } catch (err) {
    next(err);
  }
});

// GET /teachers/:id - retrieve a single teacher
router.get('/:id', async (req, res, next) => {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (err) {
    next(err);
  }
});

// POST /teachers - create a new teacher
router.post('/', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, salary, imageUrl } = req.body;
    // basic server-side validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'firstName, lastName and email are required' });
    }
    const newTeacher = await teacherService.createTeacher({ firstName, lastName, email, phone, salary, imageUrl });
    res.status(201).json(newTeacher);
  } catch (err) {
    next(err);
  }
});

// PUT /teachers/:id - update an existing teacher
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await teacherService.updateTeacher(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /teachers/:id - remove a teacher
router.delete('/:id', async (req, res, next) => {
  try {
    await teacherService.deleteTeacher(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
