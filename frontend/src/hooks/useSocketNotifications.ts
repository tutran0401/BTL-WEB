import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

export interface SocketNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
}

interface UseSocketNotificationsOptions {
  onNewNotification?: (notification: SocketNotification) => void;
  onNewRegistration?: (data: any) => void;
  onEventApproved?: (data: any) => void;
  onEventRejected?: (data: any) => void;
  onNewComment?: (data: any) => void;
  onNewPost?: (data: any) => void;
  showToast?: boolean;
}

export function useSocketNotifications(options: UseSocketNotificationsOptions = {}) {
  const { socket, isConnected } = useSocket();
  const { 
    onNewNotification,
    onNewRegistration,
    onEventApproved,
    onEventRejected,
    onNewComment,
    onNewPost,
    showToast = true 
  } = options;

  // Handle new notification
  const handleNewNotification = useCallback((notification: SocketNotification) => {
    console.log('🔔 New notification:', notification);
    
    if (showToast) {
      toast.success(notification.message, {
        duration: 5000,
      });
    }

    onNewNotification?.(notification);
  }, [onNewNotification, showToast]);

  // Handle new registration
  const handleNewRegistration = useCallback((data: any) => {
    console.log('👤 New registration:', data);
    
    if (showToast) {
      toast.info(`Có người đăng ký: ${data.eventTitle}`, {
        duration: 4000,
      });
    }

    onNewRegistration?.(data);
  }, [onNewRegistration, showToast]);

  // Handle event approved
  const handleEventApproved = useCallback((data: any) => {
    console.log('✅ Event approved:', data);
    
    if (showToast) {
      toast.success('Sự kiện của bạn đã được duyệt!', {
        duration: 5000,
      });
    }

    onEventApproved?.(data);
  }, [onEventApproved, showToast]);

  // Handle event rejected
  const handleEventRejected = useCallback((data: any) => {
    console.log('❌ Event rejected:', data);
    
    if (showToast) {
      toast.error('Sự kiện của bạn đã bị từ chối', {
        duration: 5000,
      });
    }

    onEventRejected?.(data);
  }, [onEventRejected, showToast]);

  // Handle new comment
  const handleNewComment = useCallback((data: any) => {
    console.log('💬 New comment:', data);
    onNewComment?.(data);
  }, [onNewComment]);

  // Handle new post
  const handleNewPost = useCallback((data: any) => {
    console.log('📝 New post:', data);
    onNewPost?.(data);
  }, [onNewPost]);

  // Setup event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Register all event listeners
    socket.on('notification', handleNewNotification);
    socket.on('new-registration', handleNewRegistration);
    socket.on('event-approved', handleEventApproved);
    socket.on('event-rejected', handleEventRejected);
    socket.on('new-comment', handleNewComment);
    socket.on('new-post', handleNewPost);

    // Cleanup
    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('new-registration', handleNewRegistration);
      socket.off('event-approved', handleEventApproved);
      socket.off('event-rejected', handleEventRejected);
      socket.off('new-comment', handleNewComment);
      socket.off('new-post', handleNewPost);
    };
  }, [
    socket,
    isConnected,
    handleNewNotification,
    handleNewRegistration,
    handleEventApproved,
    handleEventRejected,
    handleNewComment,
    handleNewPost,
  ]);

  return {
    isConnected,
  };
}

