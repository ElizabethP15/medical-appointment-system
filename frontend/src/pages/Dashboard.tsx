import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Appointment } from '../types';
import AppointmentCard from '../components/AppointmentCard';

type FilterType = 'upcoming' | 'all' | 'cancelled';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/my')
      .then(res => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a)
      );
    } catch {
      alert('Could not cancel appointment. Please try again.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filtered = appointments.filter(apt => {
    if (filter === 'upcoming') return apt.date >= today && apt.status !== 'cancelled';
    if (filter === 'cancelled') return apt.status === 'cancelled';
    return true; // 'all'
  });

  const upcomingCount = appointments.filter(
    a => a.date >= today && a.status !== 'cancelled'
  ).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Welcome, {user?.name}</h2>
          <p className="subtitle">Manage your medical appointments</p>
        </div>
        <Link to="/doctors" className="btn-primary">
          + Book Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{upcomingCount}</span>
          <span className="stat-label">Upcoming</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{appointments.length}</span>
          <span className="stat-label">Total Appointments</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filter-tabs">
        {(['upcoming', 'all', 'cancelled'] as FilterType[]).map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="loading">Loading your appointments...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>
            {filter === 'upcoming'
              ? "No upcoming appointments."
              : "No appointments found."}
          </p>
          {filter === 'upcoming' && (
            <Link to="/doctors" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Find a Doctor
            </Link>
          )}
        </div>
      ) : (
        <div className="appointments-list">
          {filtered.map(apt => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              viewAs="patient"
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
