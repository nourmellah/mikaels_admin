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

module.exports = router;