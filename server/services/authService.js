const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRY || '7d';

async function validateUser(username, password) {
  const { rows } = await pool.query(
    'SELECT id, password_hash FROM admin WHERE username = $1',
    [username]
  );
  const admin = rows[0];
  if (!admin) return null;
  const match = await bcrypt.compare(password, admin.password_hash);
  return match ? admin.id : null;
}

async function saveRefreshToken(userId, token) {
  await pool.query(
    'UPDATE admin SET refresh_token = $1 WHERE id = $2',
    [token, userId]
  );
}

async function getStoredRefreshToken(userId) {
  const { rows } = await pool.query(
    'SELECT refresh_token FROM admin WHERE id = $1',
    [userId]
  );
  return rows[0]?.refresh_token;
}

async function clearRefreshToken(userId) {
  await pool.query(
    'UPDATE admin SET refresh_token = NULL WHERE id = $1',
    [userId]
  );
}

function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXP });
}

function generateRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_SECRET);
}

module.exports = {
  validateUser,
  saveRefreshToken,
  getStoredRefreshToken,
  clearRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
