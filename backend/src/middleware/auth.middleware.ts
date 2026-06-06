import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types'

// Este middleware verifica que el request tenga un JWT válido.
// Si es válido, adjunta los datos del usuario a req.user y llama a next().
// Si no, responde con 401 (Unauthorized) y corta la cadena.
export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // El token viene en el header Authorization con el formato: "Bearer <token>"
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No hay token → el usuario no está autenticado
    res.status(401).json({ error: 'Token de acceso requerido' })
    return // Importante: retornar para no continuar con next()
  }

  // Extraemos el token (todo lo que viene después de "Bearer ")
  const token = authHeader.substring(7)

  try {
    // jwt.verify() verifica la firma y decodifica el payload.
    // Si el token fue modificado o el SECRET no coincide, lanza un error.
    // Si el token expiró, también lanza un error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    // Adjuntamos el payload al request para usarlo en los controladores
    req.user = decoded

    // next() pasa el control al siguiente middleware o controlador
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res
        .status(401)
        .json({ error: 'Token expirado, iniciá sesión nuevamente' })
    } else {
      res.status(401).json({ error: 'Token inválido' })
    }
  }
}
