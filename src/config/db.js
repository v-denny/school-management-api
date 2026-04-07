const mysql = require('mysql2/promise');

// Create a connection pool for efficient connection management
const pool = mysql.createPool({
  host:     process.env.MYSQLHOST     || process.env.DB_HOST,
  port:     process.env.MYSQLPORT     || process.env.DB_PORT     || 3306,
  user:     process.env.MYSQLUSER     || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

/**
 * Run a query against the pool.
 * @param {string} sql
 * @param {any[]} params
 * @returns {Promise<[rows, fields]>}
 */
async function query(sql, params = []) {
  const [rows, fields] = await pool.execute(sql, params);
  return [rows, fields];
}

/**
 * Verify the database connection is reachable.
 */
async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
}

/**
 * Run DDL to create the schools table if it doesn't already exist.
 */
async function initSchema() {
  const sql = `
    CREATE TABLE IF NOT EXISTS schools (
      id          INT          NOT NULL AUTO_INCREMENT,
      name        VARCHAR(255) NOT NULL,
      address     VARCHAR(500) NOT NULL,
      latitude    FLOAT        NOT NULL,
      longitude   FLOAT        NOT NULL,
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await pool.execute(sql);
}

module.exports = { query, testConnection, initSchema, pool };
