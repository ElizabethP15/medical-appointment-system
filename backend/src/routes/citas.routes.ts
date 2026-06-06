import { Router } from 'express'
import {
  agendarCita,
  misCitas,
  actualizarCita,
  cancelarCita,
} from '../controllers/citas.controller'
import { verificarToken } from '../middleware/auth.middleware'
import { verificarRol } from '../middleware/role.middleware'

const router = Router()

// Todas las rutas de citas requieren autenticación
router.use(verificarToken)

// Cualquier usuario autenticado puede ver sus citas
router.get('/mis-citas', misCitas)

// Solo pacientes pueden agendar citas
router.post('/', verificarRol('PACIENTE'), agendarCita)

// Solo pacientes pueden cancelar sus propias citas
router.patch('/:id/cancelar', verificarRol('PACIENTE'), cancelarCita)

// Solo médicos pueden actualizar el estado de una cita (confirmar, completar)
router.put('/:id', verificarRol('MEDICO'), actualizarCita)

export default router
