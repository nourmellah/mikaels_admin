const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log('✅  GET /api/hello hit at', new Date().toISOString());
  res.json({ message: 'Hello from Express!' });
});


module.exports = router;
