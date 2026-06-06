import { Request, Response, NextFunction } from 'express'
import { JwtPayload } from '../types'

// Esta función recibe los roles permitidos y devuelve un middleware.
export const verificarRol = (...rolesPermitidos: JwtPayload['rol'][]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Para este punto, verificarToken ya corrió y adjuntó req.user
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }

    // Verificamos si el rol del usuario está en la lista de roles permitidos
    if (!rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({
        error: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
      })
      return
    }

    // El rol es válido → continuar
    next()
  }
}
