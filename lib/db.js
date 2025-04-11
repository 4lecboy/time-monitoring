import mysql from 'mysql2/promise';

// Create optimized connection pool for 700+ users
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'time_monitoring',
  waitForConnections: true,
  connectionLimit: 50, // Increased for high concurrency
  maxIdle: 20, // Max idle connections to keep
  idleTimeout: 60000, // How long a connection can be idle before being removed
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Monitor pool connections
pool.on('connection', () => {
  console.log('DB Pool: New connection established');
});

pool.on('acquire', () => {
  console.log('DB Pool: Connection acquired from pool');
});

pool.on('release', () => {
  console.log('DB Pool: Connection released back to pool');
});

export async function query(sql, params = []) {
  try {
    // Debug logging in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`Executing SQL: ${sql}`);
      console.log('With params:', params);
    }
    
    const [rows] = await pool.query(sql, params);
    
    // Debug response size in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`Query returned ${Array.isArray(rows) ? rows.length : 1} results`);
    }
    
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Check if the pool is healthy
export async function healthCheck() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export default pool;