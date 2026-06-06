import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { citasService, medicosService, type Cita } from '../services/api';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

export default function MedicoDashboard() {
  const { usuario, logout } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [vista, setVista] = useState<'agenda' | 'disponibilidad'>('agenda');
  const [loading, setLoading] = useState(true);

  // Estado para configurar disponibilidad
  const [disponibilidad, setDisponibilidad] = useState<
    Array<{ diaSemana: string; horaInicio: string; horaFin: string }>
  >([]);
  const [mensajeDisp, setMensajeDisp] = useState('');

  useEffect(() => {
    citasService.misCitas().then((res) => {
      setCitas(res.data);
      setLoading(false);
    });
  }, []);

  const handleActualizarCita = async (id: string, estado: string, notas?: string) => {
    try {
      await citasService.actualizar(id, estado, notas);
      const res = await citasService.misCitas();
      setCitas(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const agregarBloque = () => {
    setDisponibilidad([...disponibilidad, { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }]);
  };

  const actualizarBloque = (index: number, campo: string, valor: string) => {
    const nueva = [...disponibilidad];
    nueva[index] = { ...nueva[index], [campo]: valor };
    setDisponibilidad(nueva);
  };

  const eliminarBloque = (index: number) => {
    setDisponibilidad(disponibilidad.filter((_, i) => i !== index));
  };

  const guardarDisponibilidad = async () => {
    try {
      await medicosService.configurarDisponibilidad(disponibilidad);
      setMensajeDisp('✅ Disponibilidad guardada exitosamente');
    } catch (err: any) {
      setMensajeDisp('❌ ' + (err.response?.data?.error || 'Error al guardar'));
    }
  };

  const coloresEstado: Record<string, string> = {
    PENDIENTE: '#fef3c7', CONFIRMADA: '#d1fae5', CANCELADA: '#fee2e2', COMPLETADA: '#dbeafe',
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Dr(a). {usuario?.nombre} {usuario?.apellido}</h1>
          <p style={{ color: '#6b7280' }}>Panel Médico</p>
        </div>
        <button onClick={logout} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setVista('agenda')}
          style={{ padding: '0.5rem 1rem', background: vista === 'agenda' ? '#2563eb' : '#e5e7eb', color: vista === 'agenda' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Mi Agenda
        </button>
        <button onClick={() => setVista('disponibilidad')}
          style={{ padding: '0.5rem 1rem', background: vista === 'disponibilidad' ? '#2563eb' : '#e5e7eb', color: vista === 'disponibilidad' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Mi Disponibilidad
        </button>
      </div>

      {/* Vista: Agenda */}
      {vista === 'agenda' && (
        <div>
          <h2>Agenda ({citas.filter(c => c.estado !== 'CANCELADA').length} citas activas)</h2>
          {citas.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No tenés citas agendadas.</p>
          ) : (
            citas.map((cita) => (
              <div key={cita.id} style={{ background: coloresEstado[cita.estado], border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <strong>{cita.paciente?.usuario.nombre} {cita.paciente?.usuario.apellido}</strong>
                <p>📧 {cita.paciente?.usuario.email}</p>
                <p>📅 {new Date(cita.fecha).toLocaleString('es-CO')}</p>
                {cita.motivo && <p>📝 Motivo: {cita.motivo}</p>}
                <p>Estado: <strong>{cita.estado}</strong></p>

                {cita.estado === 'PENDIENTE' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button onClick={() => handleActualizarCita(cita.id, 'CONFIRMADA')}
                      style={{ padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      ✅ Confirmar
                    </button>
                    <button onClick={() => handleActualizarCita(cita.id, 'CANCELADA')}
                      style={{ padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      ❌ Cancelar
                    </button>
                  </div>
                )}
                {cita.estado === 'CONFIRMADA' && (
                  <button onClick={() => handleActualizarCita(cita.id, 'COMPLETADA')}
                    style={{ padding: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.75rem' }}>
                    🏁 Marcar como Completada
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista: Disponibilidad */}
      {vista === 'disponibilidad' && (
        <div>
          <h2>Configurar Disponibilidad</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Definí en qué días y horarios atendés pacientes.
          </p>

          {mensajeDisp && (
            <div style={{ background: mensajeDisp.includes('✅') ? '#d1fae5' : '#fee2e2', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
              {mensajeDisp}
            </div>
          )}

          {disponibilidad.map((bloque, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <select value={bloque.diaSemana} onChange={(e) => actualizarBloque(i, 'diaSemana', e.target.value)}
                style={{ padding: '0.5rem' }}>
                {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="time" value={bloque.horaInicio} onChange={(e) => actualizarBloque(i, 'horaInicio', e.target.value)}
                style={{ padding: '0.5rem' }} />
              <span>a</span>
              <input type="time" value={bloque.horaFin} onChange={(e) => actualizarBloque(i, 'horaFin', e.target.value)}
                style={{ padding: '0.5rem' }} />
              <button onClick={() => eliminarBloque(i)}
                style={{ padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                🗑️
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={agregarBloque}
              style={{ padding: '0.5rem 1rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + Agregar día
            </button>
            <button onClick={guardarDisponibilidad}
              style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Guardar Disponibilidad
            </button>
          </div>
        </div>
      )}
    </div>
  );
}