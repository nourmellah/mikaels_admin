// routes/auth.js
const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcrypt');
const { Pool } = require('pg');
const router   = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1) LOGIN – issue tokens & save refresh token in DB
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
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
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }  // e.g. '15m'
  );
  const refreshToken = jwt.sign(
    { sub: admin.id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }  // e.g. '7d'
  );

  // persist refresh token
  await pool.query(
    'UPDATE admin SET refresh_token = $1 WHERE id = $2',
    [ refreshToken, admin.id ]
  );

  // send refresh token as HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ accessToken });
});

// 2) REFRESH – validate cookie + DB, then issue new access token
router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.REFRESH_SECRET);
  } catch {
    return res.sendStatus(403);
  }

  // ensure it matches what’s in the DB
  const { rows } = await pool.query(
    'SELECT refresh_token FROM admin WHERE id = $1',
    [ payload.sub ]
  );
  if (rows[0]?.refresh_token !== token) {
    return res.sendStatus(403);
  }

  // OK—issue new access token
  const newAccess = jwt.sign(
    { sub: payload.sub },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  res.json({ accessToken: newAccess });
});

// 3) LOGOUT – clear DB token + cookie
router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const { sub } = jwt.verify(token, process.env.REFRESH_SECRET);
      await pool.query(
        'UPDATE admin SET refresh_token = NULL WHERE id = $1',
        [ sub ]
      );
    } catch {
      // ignore invalid token
    }
  }
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  res.sendStatus(204);
});

module.exports = router;
