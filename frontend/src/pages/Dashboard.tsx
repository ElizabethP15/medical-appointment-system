import { useAuth } from '../context/AuthContext';
import PacienteDashboard from './PacienteDashboard';
import MedicoDashboard from './MedicoDashboard';

export default function Dashboard() {
  const { usuario } = useAuth();

  if (usuario?.rol === 'MEDICO') return <MedicoDashboard />;
  return <PacienteDashboard />;
}