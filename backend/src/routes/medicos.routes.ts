import { Router } from 'express'
import {
  listarMedicos,
  obtenerMedico,
  configurarDisponibilidad,
} from '../controllers/medicos.controller'
import { verificarToken } from '../middleware/auth.middleware'
import { verificarRol } from '../middleware/role.middleware'

const router = Router()

// Rutas públicas
router.get('/', listarMedicos)
router.get('/:id', obtenerMedico)

// Ruta protegida: solo médicos pueden configurar su disponibilidad
// La cadena de middlewares se ejecuta en orden: verificarToken → verificarRol → configurarDisponibilidad
router.put(
  '/disponibilidad',
  verificarToken,
  verificarRol('MEDICO'),
  configurarDisponibilidad,
)

export default router
