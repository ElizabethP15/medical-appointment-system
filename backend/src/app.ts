import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import doctorRoutes from './routes/doctors.routes'
import appointmentRoutes from './routes/appointments.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/appointments', appointmentRoutes)

// Health check (útil para Railway/Docker)
app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
