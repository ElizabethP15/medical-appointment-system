export interface User {
  id: number
  name: string
  email: string
  role: 'patient' | 'doctor'
}

export interface Doctor {
  id: number
  name: string
  email: string
  specialty: string
  bio: string
}

export interface Appointment {
  id: number
  doctor_id: number
  patient_id: number
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
  doctor_name?: string
  patient_name?: string
  specialty?: string
}
