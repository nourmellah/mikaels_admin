const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.sendStatus(401);

  const token = auth.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.userId = payload.sub;   // the admin’s ID
    next();
  });
};
