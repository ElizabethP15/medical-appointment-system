import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { citasService, medicosService, type Cita, type Medico } from '../services/api';

export default function PacienteDashboard() {
  const { usuario, logout } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [vista, setVista] = useState<'citas' | 'agendar'>('citas');
  const [loading, setLoading] = useState(true);

  // Estado del formulario de nueva cita
  const [nuevaCita, setNuevaCita] = useState({
    medicoId: '',
    fecha: '',
    hora: '',
    motivo: '',
  });
  const [mensajeCita, setMensajeCita] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [citasRes, medicosRes] = await Promise.all([
          citasService.misCitas(),
          medicosService.listar(),
        ]);
        setCitas(citasRes.data);
        setMedicos(medicosRes.data);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeCita('');
    try {
      // Combinamos fecha y hora en un ISO string
      const fechaHora = `${nuevaCita.fecha}T${nuevaCita.hora}:00`;
      await citasService.agendar(nuevaCita.medicoId, fechaHora, nuevaCita.motivo);
      setMensajeCita('¡Cita agendada exitosamente!');
      // Recargamos las citas
      const res = await citasService.misCitas();
      setCitas(res.data);
      setVista('citas');
    } catch (err: any) {
      setMensajeCita(err.response?.data?.error || 'Error al agendar');
    }
  };

  const handleCancelar = async (id: string) => {
    if (!confirm('¿Seguro que querés cancelar esta cita?')) return;
    try {
      await citasService.cancelar(id);
      const res = await citasService.misCitas();
      setCitas(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al cancelar');
    }
  };

  // Colores por estado de cita para feedback visual
  const coloresEstado: Record<string, string> = {
    PENDIENTE: '#fef3c7',
    CONFIRMADA: '#d1fae5',
    CANCELADA: '#fee2e2',
    COMPLETADA: '#dbeafe',
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Hola, {usuario?.nombre} 👋</h1>
          <p style={{ color: '#6b7280' }}>Panel de Paciente</p>
        </div>
        <button onClick={logout} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>

      {/* Navegación entre vistas */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setVista('citas')}
          style={{ padding: '0.5rem 1rem', background: vista === 'citas' ? '#2563eb' : '#e5e7eb', color: vista === 'citas' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Mis Citas
        </button>
        <button onClick={() => setVista('agendar')}
          style={{ padding: '0.5rem 1rem', background: vista === 'agendar' ? '#2563eb' : '#e5e7eb', color: vista === 'agendar' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Agendar Cita
        </button>
      </div>

      {/* Vista: Mis Citas */}
      {vista === 'citas' && (
        <div>
          <h2>Mis Citas</h2>
          {citas.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No tenés citas agendadas.</p>
          ) : (
            citas.map((cita) => (
              <div key={cita.id} style={{
                background: coloresEstado[cita.estado] || '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>Dr(a). {cita.medico?.usuario.nombre} {cita.medico?.usuario.apellido}</strong>
                    <p>📅 {new Date(cita.fecha).toLocaleString('es-CO')}</p>
                    {cita.motivo && <p>📝 Motivo: {cita.motivo}</p>}
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Estado: {cita.estado}</span>
                  </div>
                  {(cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA') && (
                    <button onClick={() => handleCancelar(cita.id)}
                      style={{ padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'center' }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista: Agendar Cita */}
      {vista === 'agendar' && (
        <div>
          <h2>Agendar Nueva Cita</h2>
          {mensajeCita && (
            <div style={{ background: mensajeCita.includes('exitosamente') ? '#d1fae5' : '#fee2e2', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
              {mensajeCita}
            </div>
          )}
          <form onSubmit={handleAgendar}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Médico</label>
              <select value={nuevaCita.medicoId} onChange={(e) => setNuevaCita({ ...nuevaCita, medicoId: e.target.value })}
                required style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}>
                <option value="">Seleccioná un médico</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    Dr(a). {m.usuario.nombre} {m.usuario.apellido} — {m.especialidad}
                  </option>
                ))}
              </select>
            </div>

            {/* Si hay médico seleccionado, mostramos su disponibilidad */}
            {nuevaCita.medicoId && (
              <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong>Disponibilidad:</strong>
                {medicos.find(m => m.id === nuevaCita.medicoId)?.disponibilidad.map((d) => (
                  <p key={d.id}>📅 {d.diaSemana}: {d.horaInicio} - {d.horaFin}</p>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label>Fecha</label>
              <input type="date" value={nuevaCita.fecha}
                onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                required style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Hora</label>
              <input type="time" value={nuevaCita.hora}
                onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                required style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Motivo de consulta (opcional)</label>
              <input value={nuevaCita.motivo}
                onChange={(e) => setNuevaCita({ ...nuevaCita, motivo: e.target.value })}
                style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
            </div>

            <button type="submit"
              style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Agendar Cita
            </button>
          </form>
        </div>
      )}
    </div>
  );
}