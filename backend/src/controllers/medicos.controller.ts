import { Request, Response } from 'express'
import prisma from '../config/prisma'

// ─── LISTAR TODOS LOS MÉDICOS ─────────────────────────────────────────────
// Ruta pública: cualquiera puede ver los médicos disponibles
export const listarMedicos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const medicos = await prisma.medico.findMany({
      // include le dice a Prisma que traiga también la relación
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        // Traemos los horarios de disponibilidad
        disponibilidad: true,
      },
    })

    res.json(medicos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener médicos' })
  }
}

// ─── VER UN MÉDICO ESPECÍFICO ─────────────────────────────────────────────
export const obtenerMedico = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params // El ID viene en la URL: /api/medicos/:id

    const medico = await prisma.medico.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { nombre: true, apellido: true, email: true },
        },
        disponibilidad: true,
      },
    })

    if (!medico) {
      res.status(404).json({ error: 'Médico no encontrado' })
      return
    }

    res.json(medico)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener médico' })
  }
}

// ─── CONFIGURAR DISPONIBILIDAD (solo médicos) ─────────────────────────────
// El médico define en qué días y horarios atiende
export const configurarDisponibilidad = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Buscamos el perfil de médico del usuario autenticado
    const medico = await prisma.medico.findUnique({
      where: { usuarioId: req.user!.userId },
    })

    if (!medico) {
      res.status(404).json({ error: 'Perfil de médico no encontrado' })
      return
    }

    // El body debe ser un array con los bloques de disponibilidad
    const { disponibilidad } = req.body as {
      disponibilidad: Array<{
        diaSemana: string
        horaInicio: string
        horaFin: string
      }>
    }

    if (!Array.isArray(disponibilidad) || disponibilidad.length === 0) {
      res.status(400).json({ error: 'Enviá un array de disponibilidad' })
      return
    }

    // Reemplazamos toda la disponibilidad existente:
    // 1. Borramos la disponibilidad actual del médico
    // 2. Insertamos la nueva
    // Hacemos ambas operaciones en una transacción para que sean atómicas
    await prisma.$transaction(async (tx: any) => {
      await tx.disponibilidad.deleteMany({
        where: { medicoId: medico.id },
      })

      await tx.disponibilidad.createMany({
        data: disponibilidad.map((d) => ({
          medicoId: medico.id,
          diaSemana: d.diaSemana as any,
          horaInicio: d.horaInicio,
          horaFin: d.horaFin,
        })),
      })
    })

    // Traemos la disponibilidad actualizada para confirmar
    const disponibilidadActualizada = await prisma.disponibilidad.findMany({
      where: { medicoId: medico.id },
    })

    res.json({
      message: 'Disponibilidad actualizada exitosamente',
      disponibilidad: disponibilidadActualizada,
    })
  } catch (error) {
    console.error('Error configurando disponibilidad:', error)
    res.status(500).json({ error: 'Error al configurar disponibilidad' })
  }
}
