import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type Usuario } from '../services/api';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);  // true mientras verificamos la sesión

  // Verificamos si hay un token guardado y si sigue siendo válido.
  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Llamamos a /api/auth/me — si el token es válido, devuelve el usuario
        const { data } = await authService.getMe();
        setUsuario(data);
      } catch {
        // Token inválido o expirado → limpiamos el localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authService.login(email, password);
    // Guardamos el token en localStorage para que persista entre recargas
    localStorage.setItem('token', data.token);
    setUsuario(data.usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      loading,
      login,
      logout,
      isAuthenticated: !!usuario,  // !! convierte a boolean
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado: simplifica el uso del contexto en los componentes
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}