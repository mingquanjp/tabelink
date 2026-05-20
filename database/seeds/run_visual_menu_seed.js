const fs = require('fs');
const path = require('path');

require(path.resolve(__dirname, '../../backend/node_modules/dotenv')).config({
  path: path.resolve(__dirname, '../../backend/.env'),
});

const { Client } = require(path.resolve(__dirname, '../../backend/node_modules/pg'));

const TABLES = [
  'user_account',
  'customer_profile',
  'owner_profile',
  'restaurant',
  'restaurant_media',
  'restaurant_feature',
  'restaurant_payment_method',
  'menu_category',
  'menu_item',
  'menu_item_criterion',
  'blog_post',
  'blog_media',
  'promotion',
];

function extractInsert(sql, tableName) {
  const marker = `INSERT INTO ${tableName} `;
  const start = sql.indexOf(marker);

  if (start === -1) {
    throw new Error(`Could not find ${marker}`);
  }

  const conflict = sql.indexOf('\nON CONFLICT ', start);
  const end = sql.indexOf(';', conflict);

  if (conflict === -1 || end === -1) {
    throw new Error(`Could not extract insert for ${tableName}`);
  }

  return sql.slice(start, end + 1);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is missing in backend/.env');
  }

  const sql = fs.readFileSync(path.resolve(__dirname, 'mock_data.sql'), 'utf8');
  const statements = TABLES.map((tableName) => extractInsert(sql, tableName));
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('connected');

  try {
    await client.query('BEGIN');
    for (const statement of statements) {
      await client.query(statement);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }

  console.log('visual/menu seed applied');

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
