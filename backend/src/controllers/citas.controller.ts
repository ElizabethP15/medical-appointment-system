import { Request, Response } from 'express'
import prisma from '../config/prisma'

// ─── AGENDAR CITA (solo pacientes) ───────────────────────────────────────
export const agendarCita = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { medicoId, fecha, motivo } = req.body

    if (!medicoId || !fecha) {
      res.status(400).json({ error: 'medicoId y fecha son obligatorios' })
      return
    }

    // Buscamos el paciente autenticado
    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: req.user!.userId },
    })

    if (!paciente) {
      res.status(404).json({ error: 'Perfil de paciente no encontrado' })
      return
    }

    // Verificamos que el médico exista y tenga disponibilidad en ese día
    const fechaCita = new Date(fecha)

    // getDay() devuelve 0=Domingo, 1=Lunes... 6=Sábado
    // Lo mapeamos a nuestros valores del enum DiaSemana
    const diasMap: Record<number, string> = {
      0: 'DOMINGO',
      1: 'LUNES',
      2: 'MARTES',
      3: 'MIERCOLES',
      4: 'JUEVES',
      5: 'VIERNES',
      6: 'SABADO',
    }
    const diaSemana = diasMap[fechaCita.getDay()]

    // Formateamos la hora como "HH:MM"
    const hora = fechaCita.toTimeString().substring(0, 5)

    // Verificamos si el médico tiene disponibilidad ese día
    const disponibilidad = await prisma.disponibilidad.findFirst({
      where: {
        medicoId,
        diaSemana: diaSemana as any,
      },
    })

    if (!disponibilidad) {
      res.status(400).json({
        error: `El médico no atiende los ${diaSemana.toLowerCase()}`,
      })
      return
    }

    // Verificamos que la hora esté dentro del horario del médico
    if (hora < disponibilidad.horaInicio || hora >= disponibilidad.horaFin) {
      res.status(400).json({
        error: `El médico atiende de ${disponibilidad.horaInicio} a ${disponibilidad.horaFin}`,
      })
      return
    }

    // Verificamos que no haya otra cita en ese mismo horario con ese médico
    const citaExistente = await prisma.cita.findFirst({
      where: {
        medicoId,
        fecha: fechaCita,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
    })

    if (citaExistente) {
      res.status(409).json({ error: 'Ese horario ya está ocupado' })
      return
    }

    // Creamos la cita
    const nuevaCita = await prisma.cita.create({
      data: {
        pacienteId: paciente.id,
        medicoId,
        fecha: fechaCita,
        motivo: motivo || null,
      },
      include: {
        medico: {
          include: {
            usuario: { select: { nombre: true, apellido: true } },
          },
        },
      },
    })

    res.status(201).json({
      message: 'Cita agendada exitosamente',
      cita: nuevaCita,
    })
  } catch (error) {
    console.error('Error agendando cita:', error)
    res.status(500).json({ error: 'Error al agendar la cita' })
  }
}

// ─── MIS CITAS (paciente ve las suyas, médico ve las suyas) ──────────────
export const misCitas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rol, userId } = req.user!

    if (rol === 'PACIENTE') {
      const paciente = await prisma.paciente.findUnique({
        where: { usuarioId: userId },
      })
      if (!paciente) {
        res.status(404).json({ error: 'Perfil de paciente no encontrado' })
        return
      }

      const citas = await prisma.cita.findMany({
        where: { pacienteId: paciente.id },
        include: {
          medico: {
            include: {
              usuario: { select: { nombre: true, apellido: true } },
            },
          },
        },
        orderBy: { fecha: 'asc' },
      })

      res.json(citas)
    } else if (rol === 'MEDICO') {
      const medico = await prisma.medico.findUnique({
        where: { usuarioId: userId },
      })
      if (!medico) {
        res.status(404).json({ error: 'Perfil de médico no encontrado' })
        return
      }

      const citas = await prisma.cita.findMany({
        where: { medicoId: medico.id },
        include: {
          paciente: {
            include: {
              usuario: {
                select: { nombre: true, apellido: true, email: true },
              },
            },
          },
        },
        orderBy: { fecha: 'asc' },
      })

      res.json(citas)
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas' })
  }
}

// ─── ACTUALIZAR ESTADO DE CITA (solo médicos) ────────────────────────────
export const actualizarCita = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params
    const { estado, notas } = req.body

    const estadosValidos = ['CONFIRMADA', 'CANCELADA', 'COMPLETADA']
    if (!estadosValidos.includes(estado)) {
      res
        .status(400)
        .json({ error: `Estado inválido. Usá: ${estadosValidos.join(', ')}` })
      return
    }

    // Verificamos que la cita pertenece al médico autenticado
    const medico = await prisma.medico.findUnique({
      where: { usuarioId: req.user!.userId },
    })

    const cita = await prisma.cita.findFirst({
      where: { id, medicoId: medico?.id },
    })

    if (!cita) {
      res.status(404).json({ error: 'Cita no encontrada o no te pertenece' })
      return
    }

    const citaActualizada = await prisma.cita.update({
      where: { id },
      data: { estado: estado as any, notas: notas || undefined },
    })

    res.json({ message: 'Cita actualizada', cita: citaActualizada })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la cita' })
  }
}

// ─── CANCELAR CITA (paciente cancela la suya) ────────────────────────────
export const cancelarCita = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params

    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: req.user!.userId },
    })

    const cita = await prisma.cita.findFirst({
      where: { id, pacienteId: paciente?.id },
    })

    if (!cita) {
      res.status(404).json({ error: 'Cita no encontrada o no te pertenece' })
      return
    }

    if (cita.estado === 'COMPLETADA') {
      res.status(400).json({ error: 'No podés cancelar una cita completada' })
      return
    }

    await prisma.cita.update({
      where: { id },
      data: { estado: 'CANCELADA' },
    })

    res.json({ message: 'Cita cancelada exitosamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar la cita' })
  }
}
