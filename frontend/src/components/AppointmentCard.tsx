import React from 'react';

export type ViewAs = 'patient' | 'doctor' | 'admin';

export interface Appointment {
  id: string | number;
  date?: string;
  time?: string;
  doctorName?: string;
  patientName?: string;
  status?: string;
  [key: string]: any;
}

export interface AppointmentCardProps {
  appointment: Appointment;
  viewAs?: ViewAs;
  onCancel?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, viewAs = 'patient', onCancel }) => {
  const handleCancel = () => {
    if (onCancel) onCancel(appointment);
  };

  return (
    <div style={cardStyle} role="article" aria-label={`appointment-${appointment.id}`}>
      <div style={headerStyle}>
        <strong>{viewAs === 'patient' ? appointment.doctorName ?? 'Doctor' : appointment.patientName ?? 'Patient'}</strong>
        <span style={{ fontSize: 12, color: '#666' }}>{appointment.status ?? 'Scheduled'}</span>
      </div>
      <div style={bodyStyle}>
        <div>{appointment.date ?? 'Date not set'}</div>
        <div>{appointment.time ?? 'Time not set'}</div>
      </div>
      <div style={footerStyle}>
        <button onClick={handleCancel} style={buttonStyle}>Cancel</button>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
  background: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8
};

const bodyStyle: React.CSSProperties = {
  marginBottom: 8,
  color: '#333'
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end'
};

const buttonStyle: React.CSSProperties = {
  background: '#e53935',
  color: '#fff',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 4,
  cursor: 'pointer'
};

export default AppointmentCard;
