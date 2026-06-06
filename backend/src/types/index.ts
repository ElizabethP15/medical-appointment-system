// Payload del JWT: lo que guardamos dentro del token
export interface JwtPayload {
  userId: string // ID del usuario (UUID)
  rol: 'PACIENTE' | 'MEDICO' // Solo estos dos valores son válidos
}

// Extendemos el tipo Request de Express para incluir el usuario autenticado.
// Así podemos acceder a req.user en los controladores después de verificar el JWT.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload // El ? significa que puede no estar presente
    }
  }
}
