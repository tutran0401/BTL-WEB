import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

export type SocketEventCallback = (data: any) => void;

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
  // Event listeners
  onEventUpdated: (callback: SocketEventCallback) => () => void;
  onEventApproved: (callback: SocketEventCallback) => () => void;
  onEventDeleted: (callback: SocketEventCallback) => () => void;
  onEventRejected: (callback: SocketEventCallback) => () => void;
  onRegistrationUpdated: (callback: SocketEventCallback) => () => void;
  onUserNotification: (callback: SocketEventCallback) => () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinEvent: () => { },
  leaveEvent: () => { },
  onEventUpdated: () => () => { },
  onEventApproved: () => () => { },
  onEventDeleted: () => () => { },
  onEventRejected: () => () => { },
  onRegistrationUpdated: () => () => { },
  onUserNotification: () => () => { },
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !user) {
      // Disconnect if socket exists
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      auth: {
        userId: user.id,
        role: user.role,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const joinEvent = (eventId: string) => {
    if (socket && isConnected) {
      socket.emit('join-event', eventId);
      console.log(`📍 Joined event room: ${eventId}`);
    }
  };

  const leaveEvent = (eventId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-event', eventId);
      console.log(`🚪 Left event room: ${eventId}`);
    }
  };

  // Event listener helpers
  const onEventUpdated = useCallback((callback: SocketEventCallback) => {
    if (!socket || !user) return () => { };

    const eventName = `user:${user.id}:event:updated`;
    socket.on(eventName, callback);
    console.log(`👂 Listening to ${eventName}`);

    return () => {
      socket.off(eventName, callback);
      console.log(`🔇 Stopped listening to ${eventName}`);
    };
  }, [socket, user]);

  const onEventApproved = useCallback((callback: SocketEventCallback) => {
    if (!socket) return () => { };

    const eventName = 'event:approved';
    socket.on(eventName, callback);
    console.log(`👂 Listening to ${eventName}`);

    return () => {
      socket.off(eventName, callback);
      console.log(`🔇 Stopped listening to ${eventName}`);
    };
  }, [socket]);

  const onRegistrationUpdated = useCallback((callback: SocketEventCallback) => {
    if (!socket || !user) return () => { };

    const eventName = `user:${user.id}:registration:updated`;
    socket.on(eventName, callback);
    console.log(`👂 Listening to ${eventName}`);

    return () => {
      socket.off(eventName, callback);
      console.log(`🔇 Stopped listening to ${eventName}`);
    };
  }, [socket, user]);

  const onUserNotification = useCallback((callback: SocketEventCallback) => {
    if (!socket || !user) return () => { };

    const eventName = `user:${user.id}:notification`;
    socket.on(eventName, callback);
    console.log(`👂 Listening to ${eventName}`);

    return () => {
      socket.off(eventName, callback);
      console.log(`🔇 Stopped listening to ${eventName}`);
    };
  }, [socket, user]);

  const onEventDeleted = useCallback((callback: SocketEventCallback) => {
    if (!socket) return () => { };

    const eventName = 'event:deleted';
    socket.on(eventName, callback);
    console.log(`👂 Listening to ${eventName}`);

    return () => {
      socket.off(eventName, callback);
      console.log(`🔇 Stopped listening to ${eventName}`);
    };
  }, [socket]);

  const onEventRejected = useCallback((callback: SocketEventCallback) => {
    if (!socket) return () => { };

    const eventName = 'event:rejected';
    socket.on(eventName, callback);
    console.log(`👂 Listening to ${eventName}`);

    return () => {
      socket.off(eventName, callback);
      console.log(`🔇 Stopped listening to ${eventName}`);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      joinEvent,
      leaveEvent,
      onEventUpdated,
      onEventApproved,
      onEventDeleted,
      onEventRejected,
      onRegistrationUpdated,
      onUserNotification
    }}>
      {children}
    </SocketContext.Provider>
  );
}

