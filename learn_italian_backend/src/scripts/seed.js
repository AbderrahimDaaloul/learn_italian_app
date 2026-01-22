require('dotenv').config();
const { Client } = require('pg');
const words = require('../utils/constants');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

async function seedDatabase() {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    await client.connect();
    console.log(`Connected to database ${DB_NAME}. Seeding data...`);
    console.log(`Loaded ${words.length} words from constants.js`);

    let insertedCount = 0;
    
    // Begin transaction
    await client.query('BEGIN');

    for (const [italian, english] of words) {
      // Optional: Check if exists to avoid duplicates if run multiple times
      // For now, we'll just insert. If you want unique constraints, add them to the schema.
      const checkRes = await client.query('SELECT id FROM translations WHERE italian_word = $1', [italian]);
      
      if (checkRes.rowCount === 0) {
        await client.query(
          'INSERT INTO translations (italian_word, english_word) VALUES ($1, $2)',
          [italian, english]
        );
        insertedCount++;
      }
    }

    await client.query('COMMIT');
    console.log(`Successfully inserted ${insertedCount} words.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', err);
  } finally {
    await client.end();
  }
}

seedDatabase();
