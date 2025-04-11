import bcrypt from 'bcryptjs';

// Hash a password before storing it
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify a password against its hash
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}