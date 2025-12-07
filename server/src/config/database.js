const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const schema = require('./schema');

// Create MySQL connection pool
const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create Drizzle instance
const db = drizzle(poolConnection, { schema, mode: 'default' });

// Handle cleanup on app termination
process.on('beforeExit', async () => {
  await poolConnection.end();
});

module.exports = db;
