// api/users/register.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, phone, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, phone`,
      [email, phone, hashedPassword]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // TODO: Send verification email/SMS
    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
}
