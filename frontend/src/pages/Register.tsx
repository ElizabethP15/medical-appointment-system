import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'PACIENTE' as 'PACIENTE' | 'MEDICO',
    especialidad: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Manejador genérico para todos los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(form);
      // Después de registrarse, hacemos login automáticamente
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h1>Crear Cuenta</h1>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Apellido</label>
          <input name="apellido" value={form.apellido} onChange={handleChange} required
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Contraseña</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Soy</label>
          <select name="rol" value={form.rol} onChange={handleChange}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}>
            <option value="PACIENTE">Paciente</option>
            <option value="MEDICO">Médico</option>
          </select>
        </div>

        {/* Este campo solo aparece si el rol es MEDICO */}
        {form.rol === 'MEDICO' && (
          <div style={{ marginBottom: '1rem' }}>
            <label>Especialidad</label>
            <input name="especialidad" value={form.especialidad} onChange={handleChange} required
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
        )}

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </div>
  );
}