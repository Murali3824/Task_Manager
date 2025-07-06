import { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL, { transports: ['websocket'] });
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // Validate token and restore user session on mount
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (err) {
          console.error('Token validation failed:', err.message);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, socket, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};