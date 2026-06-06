import { Router } from 'express'
import { register, login, getMe } from '../controllers/auth.controller'
import { verificarToken } from '../middleware/auth.middleware'

// Router es un mini-Express que agrupa rutas relacionadas
const router = Router()

// Rutas públicas (no requieren autenticación)
router.post('/register', register)
router.post('/login', login)

// Ruta protegida (requiere JWT válido)
// verificarToken se ejecuta antes de getMe
router.get('/me', verificarToken, getMe)

export default router
