const fs = require('fs');
const path = require('path');

require(path.resolve(__dirname, '../../backend/node_modules/dotenv')).config({
  path: path.resolve(__dirname, '../../backend/.env'),
});

const { Client } = require(path.resolve(__dirname, '../../backend/node_modules/pg'));

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is missing in backend/.env');
  }

  const sqlPath = path.resolve(__dirname, 'mock_data.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('connected');

  await client.query(sql);
  console.log('seed applied');

  const result = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM menu_category) AS categories,
      (SELECT COUNT(*)::int FROM menu_item WHERE deletedat IS NULL) AS menu_items,
      (
        SELECT COUNT(*)::int
        FROM restaurant_media
        WHERE mediaurl LIKE 'https://images.unsplash.com/%'
      ) AS restaurant_unsplash,
      (
        SELECT COUNT(*)::int
        FROM menu_item
        WHERE imageurl LIKE 'https://images.unsplash.com/%'
      ) AS menu_unsplash
  `);

  console.log(JSON.stringify(result.rows[0]));
  await client.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
