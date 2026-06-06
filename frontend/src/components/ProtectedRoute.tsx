import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  rolRequerido?: 'PACIENTE' | 'MEDICO';
}

// Este componente verifica si el usuario está autenticado (y opcionalmente el rol)
export default function ProtectedRoute({ children, rolRequerido }: Props) {
  const { isAuthenticated, usuario, loading } = useAuth();

  // Mientras verificamos la sesión, mostramos un loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        Cargando...
      </div>
    );
  }

  // No autenticado → al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rol incorrecto → al dashboard
  if (rolRequerido && usuario?.rol !== rolRequerido) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}