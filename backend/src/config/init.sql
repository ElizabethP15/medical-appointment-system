CREATE TABLE IF NOT EXISTS users (

  id SERIAL PRIMARY KEY,

  name VARCHAR(100) NOT NULL,

  email VARCHAR(150) UNIQUE NOT NULL,

  password VARCHAR(255) NOT NULL,

  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor')),

  created_at TIMESTAMP DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS doctors (

  id SERIAL PRIMARY KEY,

  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  specialty VARCHAR(100) NOT NULL,

  bio TEXT

);

CREATE TABLE IF NOT EXISTS appointments (

  id SERIAL PRIMARY KEY,

  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,

  date DATE NOT NULL,

  time TIME NOT NULL,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),

  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()

);

-- Datos de prueba (opcional, para desarrollo)

INSERT INTO users (name, email, password, role) VALUES

  ('Dr. Carlos Ruiz', 'carlos@clinic.com', '$2b$10$placeholder', 'doctor'),

  ('Ana García', 'ana@mail.com', '$2b$10$placeholder', 'patient')

ON CONFLICT DO NOTHING;
