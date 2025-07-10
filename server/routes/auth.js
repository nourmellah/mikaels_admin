const express = require('express');
const router = express.Router();
const {
  validateUser,
  saveRefreshToken,
  getStoredRefreshToken,
  clearRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../services/authService');

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userId = await validateUser(username, password);
  if (!userId) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  await saveRefreshToken(userId, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

// REFRESH
router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatous(401);
  let payload;
  try { payload = verifyRefreshToken(token); }
  catch { return res.sendStatus(403); }

  const stored = await getStoredRefreshToken(payload.sub);
  if (stored !== token) return res.sendStatus(403);

  const newAccess = generateAccessToken(payload.sub);
  res.json({ accessToken: newAccess });
});

// LOGOUT
router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const { sub } = verifyRefreshToken(token);
      await clearRefreshToken(sub);
    } catch {}
  }
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  res.sendStatus(204);
});

module.exports = router;
