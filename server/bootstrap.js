// npm i pg
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const bcrypt = require('bcrypt');

async function ensureDefaultAdmin(client) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  // if the username already exists, do nothing
  const { rows } = await client.query(
    'SELECT id FROM admin WHERE username = $1',
    [username]
  );
  if (rows.length) return;

  const hash = await bcrypt.hash(password, 12);
  await client.query(
    'INSERT INTO admin (username, password_hash) VALUES ($1, $2)',
    [username, hash]
  );
  console.log(`Default admin created: ${username}`);
}

async function ensureDatabaseExists() {
  console.log('Ensuring the database exists...');
  const target = new URL(process.env.DATABASE_URL);
  const targetDb = target.pathname.replace(/^\//, '') || 'mikaels_database';

  // Fallback: derive admin URL by swapping DB to 'postgres' if ADMIN_DATABASE_URL not set
  const adminUrl =
    process.env.ADMIN_DATABASE_URL ||
    (() => {
      const u = new URL(process.env.DATABASE_URL);
      u.pathname = '/postgres';
      return u.toString();
    })();

  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();

  const { rows } = await admin.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [targetDb]
  );
  if (rows.length === 0) {
    console.log(`Database ${targetDb} does not exist, creating...`);
    await admin.query(`CREATE DATABASE "${targetDb}"`);
    console.log(`Created database ${targetDb}`);
  }

  await admin.end();
}

async function bootstrap() {
  console.log('Bootstrapping the application...');
  await ensureDatabaseExists();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Check for any table your schema creates; 'admin' exists in your sql.txt
  const { rows } = await client.query(`
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'admin'
  `);

  if (rows.length === 0) {
    const sql = fs.readFileSync(path.join(__dirname, 'database_definition.sql'), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql); 
      await client.query('COMMIT');
      console.log('First-run SQL applied.');
      await ensureDefaultAdmin(client);
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('First-run SQL failed:', e);
      throw e;
    }
  } else {
    console.log('Schema already present; skipping first-run SQL.');
    await ensureDefaultAdmin(client);
  }

  await client.end();
}

module.exports = bootstrap;
