import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io('http://localhost:5000');
    setSocket(socketInstance);

    socketInstance.emit('setup', user);

    socketInstance.on('connected', () => {
      console.log('Socket client connected successfully');
    });

    socketInstance.on('userStatusChanged', ({ userId, status }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: status }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const changeStatus = (status) => {
    if (socket && user) {
      socket.emit('changeStatus', { userId: user._id, status });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, setOnlineUsers, changeStatus }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
