import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'time_monitoring',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql, params = []) {
  try {
    console.log(`Executing SQL: ${sql}`);
    console.log('With params:', params);
    
    const [rows] = await pool.query(sql, params);
    console.log(`Query returned ${rows.length} rows`);
    
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}