import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db'

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, specialty, bio } = req.body

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  if (!['patient', 'doctor'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
      email,
    ])

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role],
    )
    const newUser = result.rows[0]

    // Si es médico, crear registro en tabla doctors
    if (role === 'doctor') {
      await pool.query(
        'INSERT INTO doctors (user_id, specialty, bio) VALUES ($1, $2, $3)',
        [newUser.id, specialty || 'General', bio || ''],
      )
    }

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
    )

    return res.status(201).json({ user: newUser, token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
    )

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      token,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({ message: 'Server error' })
  }
}
