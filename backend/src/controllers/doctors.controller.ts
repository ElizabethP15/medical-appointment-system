import { Request, Response } from 'express'
import { pool } from '../config/db'

export const getAllDoctors = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT d.id, u.name, u.email, d.specialty, d.bio
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      ORDER BY u.name
    `)

    return res.json(result.rows)
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getDoctorById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `
      SELECT d.id, u.name, u.email, d.specialty, d.bio
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' })
    }

    return res.json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}
