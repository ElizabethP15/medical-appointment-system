import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Doctor } from '../types';

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors')
      .then(res => setDoctors(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="loading">Loading doctors...</p>;

  return (
    <div className="doctors-list">
      <h2>Find a Doctor</h2>

      <input
        type="text"
        placeholder="Search by name or specialty..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          padding: '10px 14px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '0.95rem',
          marginBottom: '0.5rem',
        }}
      />

      {filtered.length === 0 && (
        <p className="empty-state">No doctors found matching "{search}".</p>
      )}

      {filtered.map(doctor => (
        <div key={doctor.id} className="doctor-card">
          <div className="doctor-card-avatar">
            {doctor.name.charAt(0)}
          </div>
          <div className="doctor-card-info">
            <h3>Dr. {doctor.name}</h3>
            <span className="specialty-badge">{doctor.specialty}</span>
            {doctor.bio && <p className="doctor-card-bio">{doctor.bio}</p>}
          </div>
          <Link to={`/book/${doctor.id}`} className="btn-primary">
            Book
          </Link>
        </div>
      ))}
    </div>
  );
}
