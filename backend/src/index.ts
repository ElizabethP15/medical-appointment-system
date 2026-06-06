import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import medicosRoutes from './routes/medicos.routes'
import citasRoutes from './routes/citas.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ─── Middlewares globales ──────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())

// ─── Rutas ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/medicos', medicosRoutes)
app.use('/api/citas', citasRoutes)

// Ruta de health check: útil para verificar que el servidor está vivo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Middleware de manejo de errores ──────────────────────────────────────
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('Error no manejado:', err.stack)
    res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
  },
)

// ─── Iniciar servidor ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📚 Ambiente: ${process.env.NODE_ENV || 'development'}`)
})

export default app
