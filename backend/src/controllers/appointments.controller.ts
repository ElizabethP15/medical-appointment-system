import { Request, Response } from 'express'
import { pool } from '../config/db'

// Crear cita (paciente)
export const createAppointment = async (req: Request, res: Response) => {
  const { doctor_id, date, time, notes } = req.body
  const patient_id = req.user?.userId

  if (!doctor_id || !date || !time) {
    return res
      .status(400)
      .json({ message: 'doctor_id, date and time are required' })
  }

  try {
    // Verificar que no haya cita en ese horario con ese médico
    const conflict = await pool.query(
      'SELECT id FROM appointments WHERE doctor_id = $1 AND date = $2 AND time = $3 AND status != $4',
      [doctor_id, date, time, 'cancelled'],
    )

    if (conflict.rows.length > 0) {
      return res
        .status(409)
        .json({ message: 'That time slot is already taken' })
    }

    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [patient_id, doctor_id, date, time, notes || null],
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

// Ver citas del paciente autenticado
export const getMyAppointments = async (req: Request, res: Response) => {
  const userId = req.user?.userId
  const role = req.user?.role

  try {
    let query = ''
    let params: number[] = []

    if (role === 'patient') {
      query = `
        SELECT a.*, u.name AS doctor_name, d.specialty
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE a.patient_id = $1
        ORDER BY a.date DESC, a.time DESC
      `
      params = [userId!]
    } else {
      // Médico ve su agenda
      query = `
        SELECT a.*, u.name AS patient_name
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE d.user_id = $1
        ORDER BY a.date ASC, a.time ASC
      `
      params = [userId!]
    }

    const result = await pool.query(query, params)

    return res.json(result.rows)
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

// Cancelar cita
export const cancelAppointment = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user?.userId

  try {
    const appointment = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id],
    )

    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    const apt = appointment.rows[0]

    // Solo el paciente dueño puede cancelar
    if (apt.patient_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    if (apt.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment already cancelled' })
    }

    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', id],
    )

    return res.json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}
