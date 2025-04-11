const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'time_monitoring',
      multipleStatements: true // Allow multiple statements for table creation
    });

    console.log('Connected to database, setting up tables...');
    
    // Create activities table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(36) NOT NULL,
        name VARCHAR(50) NOT NULL,
        type ENUM('work', 'auxiliary') NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_activity_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('Activities table created or already exists');
    
    // Create timers table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS timers (
        id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        activity_id VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        accumulated_seconds INT UNSIGNED NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT FALSE,
        start_time DATETIME NULL,
        last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_user_activity_date (user_id, activity_id, date),
        INDEX idx_user_date (user_id, date),
        INDEX idx_active_timers (user_id, is_active),
        INDEX idx_activity (activity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('Timers table created or already exists');
    
    // Check if we need to insert default activities
    const [existingActivities] = await connection.execute('SELECT COUNT(*) as count FROM activities');
    
    if (existingActivities[0].count === 0) {
      // Insert default activities
      await connection.execute(`
        INSERT INTO activities (id, name, type, description) VALUES
        (UUID(), 'Voice', 'work', 'Voice calls with customers'),
        (UUID(), 'Email', 'work', 'Email correspondence'),
        (UUID(), 'Data', 'work', 'Data entry and processing'),
        (UUID(), 'Chat', 'work', 'Live chat support'),
        (UUID(), 'Support', 'work', 'Customer support tasks'),
        (UUID(), 'Break 1', 'auxiliary', 'Morning break'),
        (UUID(), 'Lunch', 'auxiliary', 'Lunch break'),
        (UUID(), 'Break 2', 'auxiliary', 'Afternoon break'),
        (UUID(), 'Rest Room', 'auxiliary', 'Rest room break'),
        (UUID(), 'Coaching', 'auxiliary', 'One-on-one coaching'),
        (UUID(), 'Training', 'auxiliary', 'Training sessions'),
        (UUID(), 'Meeting', 'auxiliary', 'Team meetings'),
        (UUID(), 'Technical', 'auxiliary', 'Technical issues');
      `);
      
      console.log('Default activities inserted');
    } else {
      console.log('Activities already exist in the database');
    }
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (connection) await connection.end();
  }
}

// Run the function
setupDatabase();