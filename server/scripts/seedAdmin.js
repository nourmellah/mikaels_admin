// server/scripts/seedAdmin.js
require('dotenv').config();           // loads DB_URL, ADMIN_USERNAME, ADMIN_PASSWORD
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const res = await pool.query(
      `INSERT INTO admin (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING`,
      [ process.env.ADMIN_USERNAME, hashed ]
    );
    console.log(res.rowCount
      ? '✅ Admin user created'
      : 'ℹ️ Admin already exists');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await pool.end();
  }
}

seed();
