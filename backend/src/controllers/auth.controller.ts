import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma'

// ─── REGISTRO ─────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, apellido, rol, especialidad } = req.body

    // Validación básica de campos obligatorios
    if (!email || !password || !nombre || !apellido || !rol) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' })
      return
    }

    // Verificamos si el email ya está registrado
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    })

    if (usuarioExistente) {
      res.status(409).json({ error: 'Este email ya está registrado' })
      return
    }

    // bcrypt.hash() toma la contraseña y la convierte en un hash irreversible.
    const passwordHash = await bcrypt.hash(password, 12)

    // Creamos el usuario en la BD dentro de una transacción.
    const resultado = await prisma.$transaction(async (tx: any) => {
      // 1. Crear el usuario base
      const nuevoUsuario = await tx.usuario.create({
        data: {
          email,
          passwordHash,
          nombre,
          apellido,
          rol,
        },
      })

      // 2. Según el rol, crear el perfil específico
      if (rol === 'MEDICO') {
        if (!especialidad) {
          throw new Error('La especialidad es obligatoria para médicos')
        }
        await tx.medico.create({
          data: {
            usuarioId: nuevoUsuario.id,
            especialidad,
          },
        })
      } else if (rol === 'PACIENTE') {
        await tx.paciente.create({
          data: {
            usuarioId: nuevoUsuario.id,
          },
        })
      }

      return nuevoUsuario
    })

    // Respondemos con 201 Created (no devolvemos el passwordHash por seguridad)
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: resultado.id,
        email: resultado.email,
        nombre: resultado.nombre,
        apellido: resultado.apellido,
        rol: resultado.rol,
      },
    })
  } catch (error) {
    console.error('Error en registro:', error)
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son obligatorios' })
      return
    }

    // Buscamos el usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    // Si el usuario no existe, damos el mismo mensaje que si la contraseña es incorrecta.
    if (!usuario) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    // bcrypt.compare() compara el password en texto plano con el hash guardado.
    const passwordValido = await bcrypt.compare(password, usuario.passwordHash)

    if (!passwordValido) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    // Generamos el JWT con el payload mínimo necesario
    const token = jwt.sign(
      { userId: usuario.id, rol: usuario.rol }, // Payload
      process.env.JWT_SECRET!, // Secret (el ! le dice a TS que no es undefined)
      { expiresIn: '7d' }, // El token expira en 7 días
    )

    // Devolvemos el token y datos básicos del usuario
    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// ─── PERFIL ───────────────────────────────────────────────────────────────
// Ruta protegida: devuelve los datos del usuario autenticado
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user fue adjuntado por el middleware verificarToken
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        creadoEn: true,
        // Incluimos el perfil según el rol
        medico: {
          select: { id: true, especialidad: true, descripcion: true },
        },
        paciente: {
          select: { id: true, fechaNacimiento: true },
        },
      },
    })

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    res.json(usuario)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
