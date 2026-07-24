const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const log = (msg) => console.log(`${GREEN}✔${RESET} ${msg}`);
const warn = (msg) => console.log(`${YELLOW}⚠${RESET}  ${msg}`);
const error = (msg) => console.log(`${RED}✖${RESET} ${msg}`);
const title = (msg) => console.log(`\n${BOLD}${msg}${RESET}`);

const ENV_CONTENT = `PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=energyflow
DB_PASSWORD=your_postgres_password_here
DB_PORT=5432
JWT_SECRET=energyflow_secret_key_change_in_production
`;

const setup = async () => {
  console.log(`\n${BOLD}${GREEN}
  ╔═══════════════════════════════════════╗
  ║     EnergyFlow — Project Setup        ║
  ║     Rural Ghana Energy Management     ║
  ╚═══════════════════════════════════════╝
  ${RESET}`);

  // ── Step 1: Create .env ──────────────────────────────────────
  title('Step 1 — Creating .env file...');
  const envPath = path.join(__dirname, '.env');

  if (fs.existsSync(envPath)) {
    warn('.env file already exists — skipping creation.');
    warn('If you need to reset it, delete it manually and re-run this script.');
  } else {
    fs.writeFileSync(envPath, ENV_CONTENT);
    log('.env file created successfully.');
  }

  // ── Step 2: Create database ──────────────────────────────────
  title('Step 2 — Creating PostgreSQL database...');
  try {
    execSync('psql -U postgres -c "CREATE DATABASE energyflow;"', {
      stdio: 'pipe',
    });
    log('Database "energyflow" created successfully.');
  } catch (err) {
    const msg = err.stderr?.toString() || '';
    if (msg.includes('already exists')) {
      warn('Database "energyflow" already exists — skipping creation.');
    } else {
      error('Failed to create database. Make sure PostgreSQL is running and your postgres user is set up.');
      error(msg);
      process.exit(1);
    }
  }

  // ── Step 3: Run schema ───────────────────────────────────────
  title('Step 3 — Running database schema...');
  const schemaPath = path.join(__dirname, 'src/config/schema.sql');
  try {
    execSync(`psql -U postgres -d energyflow -f "${schemaPath}"`, {
      stdio: 'pipe',
    });
    log('Database schema applied successfully — all tables created.');
  } catch (err) {
    error('Failed to apply schema.');
    error(err.stderr?.toString() || err.message);
    process.exit(1);
  }

  // ── Step 4: Install server dependencies ──────────────────────
  title('Step 4 — Installing server dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    log('Server dependencies installed.');
  } catch (err) {
    error('Failed to install server dependencies.');
    process.exit(1);
  }

  // ── Step 5: Install client dependencies ──────────────────────
  title('Step 5 — Installing client dependencies...');
  const clientPath = path.join(__dirname, '../client');
  if (fs.existsSync(clientPath)) {
    try {
      execSync('npm install', { stdio: 'inherit', cwd: clientPath });
      log('Client dependencies installed.');
    } catch (err) {
      error('Failed to install client dependencies.');
      process.exit(1);
    }
  } else {
    warn('Client folder not found — skipping frontend dependency installation.');
  }

  // ── Done ─────────────────────────────────────────────────────
  console.log(`
${GREEN}${BOLD}
  --- Setup complete!---
${RESET}
${YELLOW}${BOLD}  ACTION REQUIRED:${RESET}
  Open ${BOLD}server/.env${RESET} and replace:
  ${BOLD}your_postgres_password_here${RESET}
  with your actual PostgreSQL password.

${BOLD}  Then run the seed to populate the database:${RESET}
  cd server
  npm run seed

${BOLD}  Then start the application:${RESET}

  Terminal 1 — Backend:
  cd server && npm run dev

  Terminal 2 — Frontend:
  cd client && npm run dev

  Open your browser at: ${GREEN}http://localhost:5173${RESET}
`);
};

setup();