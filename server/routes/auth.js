const express    = require('express');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcrypt');
const { Pool }   = require('pg');
const router     = express.Router();

// initialize your pool (or import your existing one)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1) LOGIN – issues access + refresh tokens
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // fetch the admin
  const { rows } = await pool.query(
    'SELECT id, password_hash FROM admin WHERE username = $1',
    [ username ]
  );
  const admin = rows[0];
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // create tokens
  const accessToken = jwt.sign(
    { sub: admin.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { sub: admin.id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  // send refresh token as cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  // return access token
  res.json({ accessToken });
});

// 2) REFRESH – swap a valid refresh for a new access
router.post('/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    const newAccess = jwt.sign(
      { sub: payload.sub },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
    res.json({ accessToken: newAccess });
  });
});

// 3) LOGOUT – clear the refresh cookie
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  res.sendStatus(204);
});

module.exports = router;
