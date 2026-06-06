import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Appointment } from '../types';
import AppointmentCard from '../components/AppointmentCard';

type FilterType = 'today' | 'upcoming' | 'all';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<FilterType>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/my')
      .then(res => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  const today = getTodayDate();

  const filtered = appointments.filter(apt => {
    if (filter === 'today') return apt.date === today;
    if (filter === 'upcoming') return apt.date >= today && apt.status !== 'cancelled';
    return true; // 'all'
  });

  const todayCount = appointments.filter(a => a.date === today && a.status !== 'cancelled').length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const totalCount = appointments.filter(a => a.status !== 'cancelled').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Welcome, Dr. {user?.name}</h2>
          <p className="subtitle">Here's your schedule overview</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{todayCount}</span>
          <span className="stat-label">Today's Appointments</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{pendingCount}</span>
          <span className="stat-label">Pending Confirmation</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalCount}</span>
          <span className="stat-label">Total Active</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filter-tabs">
        {(['today', 'upcoming', 'all'] as FilterType[]).map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'today' ? "Today's" : f === 'upcoming' ? 'Upcoming' : 'All'}
          </button>
        ))}
      </div>

      {/* Lista de citas */}
      {loading ? (
        <p className="loading">Loading appointments...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>
            {filter === 'today'
              ? 'No appointments scheduled for today.'
              : 'No appointments found.'}
          </p>
        </div>
      ) : (
        <div className="appointments-list">
          {filtered.map(apt => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              viewAs="doctor"
            />
          ))}
        </div>
      )}
    </div>
  );
}
