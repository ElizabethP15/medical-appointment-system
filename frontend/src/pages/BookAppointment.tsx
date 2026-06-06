import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Doctor } from '../types';

// Horarios disponibles por defecto — podés expandir esto
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
];

// Calcula la fecha mínima (hoy) en formato YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function BookAppointment() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDoctor, setFetchingDoctor] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${doctorId}`)
      .then(res => setDoctor(res.data))
      .catch(() => setError('Doctor not found.'))
      .finally(() => setFetchingDoctor(false));
  }, [doctorId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date || !time) {
      setError('Please select a date and time.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/appointments', {
        doctor_id: Number(doctorId),
        date,
        time,
        notes: notes || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not book appointment. Try a different time.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDoctor) return <p className="loading">Loading doctor info...</p>;
  if (!doctor) return <p className="error-msg">Doctor not found.</p>;

  if (success) {
    return (
      <div className="success-container">
        <div className="success-card">
          <span className="success-icon">✅</span>
          <h3>Appointment booked!</h3>
          <p>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-container">
      <div className="doctor-info-card">
        <h2>Book Appointment</h2>
        <div className="doctor-summary">
          <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
          <div>
            <h3>Dr. {doctor.name}</h3>
            <span className="specialty-badge">{doctor.specialty}</span>
            {doctor.bio && <p className="doctor-bio">{doctor.bio}</p>}
          </div>
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            value={date}
            min={getTodayDate()}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Select Time</label>
          <div className="time-slots">
            {TIME_SLOTS.map(slot => (
              <button
                key={slot}
                type="button"
                className={`time-slot ${time === slot ? 'selected' : ''}`}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            placeholder="Describe your symptoms or reason for the appointment..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <button type="submit" disabled={loading || !date || !time} className="btn-primary">
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );
}
