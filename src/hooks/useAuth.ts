import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Invalid token');
      }
      
      setIsLoading(false);
    } catch (err) {
      setError('Session expired');
      authService.logout();
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const user = await authService.login(email, password);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated()
  };
}