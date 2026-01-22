require('dotenv').config();
const { Client } = require('pg');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

async function createDatabase() {
    const client = new Client({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: 'postgres' // Connect to default DB to create new one
    });

    try {
        await client.connect();
        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
        if (res.rowCount === 0) {
            console.log(`Creating database ${DB_NAME}...`);
            // CREATE DATABASE cannot run locally inside a transaction block, and usually doesn't take parameters for the name in the same way, but let's try sanitized string interpolation as it is a common script pattern.
            // Using quotes for the database name to handle case sensitivity if needed, although usually lowercase.
            await client.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`Database ${DB_NAME} created.`);
        } else {
            console.log(`Database ${DB_NAME} already exists.`);
        }
    } catch (err) {
        console.error('Error checking/creating database:', err);
        // If we can't connect to postgres db, maybe the user user doesn't have access or it doesn't exist. 
        // We might try connecting directly to the target DB in the next step, but if that fails, we are stuck.
        // Assuming 'postgres' database exists is standard.
    } finally {
        await client.end();
    }
}

async function createTable() {
    const client = new Client({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME
    });

    try {
        await client.connect();
        console.log('Creating tables...');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS translations (
                id SERIAL PRIMARY KEY,
                italian_word VARCHAR(255) NOT NULL,
                english_word VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Tables created successfully.');
    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1); // Exit with error so we know it failed
    } finally {
        await client.end();
    }
}

(async () => {
    // Wait for DB creation first
    await createDatabase();
    // Then create tables
    await createTable();
})();
