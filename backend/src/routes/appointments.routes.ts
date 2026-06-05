import { Router } from 'express'
import {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
} from '../controllers/appointments.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate) // Todas las rutas de citas requieren autenticación
router.post('/', createAppointment)
router.get('/my', getMyAppointments)
router.patch('/:id/cancel', cancelAppointment)

export default router
