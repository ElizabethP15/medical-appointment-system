import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
})

// Interceptor de request: se ejecuta ANTES de cada llamada.
// Aquí agregamos automáticamente el token JWT a todos los requests.
api.interceptors.request.use((config) => {
  // Leemos el token del localStorage
  const token = localStorage.getItem('token')
  if (token) {
    // Lo ponemos en el header Authorization
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de response: se ejecuta DESPUÉS de cada respuesta.
// Si el backend devuelve 401, limpiamos la sesión.
api.interceptors.response.use(
  (response) => response, // Si es exitoso, lo devolvemos tal cual
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido → forzamos logout
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ─── Tipos de respuesta ────────────────────────────────────────────────────
export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: 'PACIENTE' | 'MEDICO'
}

export interface Medico {
  id: string
  especialidad: string
  descripcion?: string
  usuario: { nombre: string; apellido: string; email: string }
  disponibilidad: Disponibilidad[]
}

export interface Disponibilidad {
  id: string
  diaSemana: string
  horaInicio: string
  horaFin: string
}

export interface Cita {
  id: string
  fecha: string
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'
  motivo?: string
  notas?: string
  medico?: { usuario: { nombre: string; apellido: string } }
  paciente?: { usuario: { nombre: string; apellido: string; email: string } }
}

// ─── Funciones de API ──────────────────────────────────────────────────────
export const authService = {
  register: (data: {
    email: string
    password: string
    nombre: string
    apellido: string
    rol: string
    especialidad?: string
  }) => api.post<{ token: string; usuario: Usuario }>('/auth/register', data),

  login: (email: string, password: string) =>
    api.post<{ token: string; usuario: Usuario }>('/auth/login', {
      email,
      password,
    }),

  getMe: () => api.get<Usuario>('/auth/me'),
}

export const medicosService = {
  listar: () => api.get<Medico[]>('/medicos'),
  obtener: (id: string) => api.get<Medico>(`/medicos/${id}`),
  configurarDisponibilidad: (disponibilidad: Omit<Disponibilidad, 'id'>[]) =>
    api.put('/medicos/disponibilidad', { disponibilidad }),
}

export const citasService = {
  misCitas: () => api.get<Cita[]>('/citas/mis-citas'),
  agendar: (medicoId: string, fecha: string, motivo?: string) =>
    api.post<{ cita: Cita }>('/citas', { medicoId, fecha, motivo }),
  actualizar: (id: string, estado: string, notas?: string) =>
    api.put(`/citas/${id}`, { estado, notas }),
  cancelar: (id: string) => api.patch(`/citas/${id}/cancelar`, {}),
}

export default api
