const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function main() {
  const sqlPathArg = process.argv[2];
  if (!sqlPathArg) {
    throw new Error('Usage: node scripts/run-sql.js <path-to-sql-file>');
  }

  loadEnv(path.resolve(__dirname, '..', '.env'));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  const sqlPath = path.resolve(process.cwd(), sqlPathArg);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }

  console.log(`Executed ${sqlPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
