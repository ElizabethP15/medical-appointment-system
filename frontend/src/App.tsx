import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Doctors from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';

// Rutas protegidas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/doctor-dashboard" element={
              <PrivateRoute><DoctorDashboard /></PrivateRoute>
            } />
            <Route path="/doctors" element={
              <PrivateRoute><Doctors /></PrivateRoute>
            } />
            <Route path="/book/:doctorId" element={
              <PrivateRoute><BookAppointment /></PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
