export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
}

export interface JwtPayload {
  userId: number;
  role: string;
}

// Extiende Request de Express para incluir el usuario autenticado

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
