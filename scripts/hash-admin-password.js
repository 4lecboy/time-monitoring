const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function hashPasswords() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'time_monitoring',
    });

    console.log('Connected to database, fetching users...');
    
    // Get all users with plain text passwords
    const [users] = await connection.execute('SELECT id, password_hash FROM users');
    
    console.log(`Found ${users.length} users to process`);
    
    // Update each user with hashed password
    for (const user of users) {
      // Skip if it looks like the password is already hashed
      if (user.password_hash && user.password_hash.length > 30) {
        console.log(`User ${user.id} already has a hashed password, skipping`);
        continue;
      }
      
      const plainPassword = user.password_hash; // Current "password_hash" is actually plain text
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      
      console.log(`Updated password for user ${user.id}`);
    }
    
    console.log('All passwords have been hashed successfully');
    
    // Close the connection
    await connection.end();
  } catch (error) {
    console.error('Error hashing passwords:', error);
  }
}

// Run the function
hashPasswords();