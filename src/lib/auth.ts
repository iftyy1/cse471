import { query } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getUserByEmail(email: string) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function getUserById(id: number) {
  const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

export async function createUser(name: string, email: string, password: string, role: string = 'student', requested_role: string | null = null) {
  const hashedPassword = await hashPassword(password);
  const result = await query(
    'INSERT INTO users (name, email, password, role, requested_role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, requested_role',
    [name, email, hashedPassword, role, requested_role]
  );
  return result.rows[0];
}

