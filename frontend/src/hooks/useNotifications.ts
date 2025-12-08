import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { notificationService } from '../services/notificationService';
import {
  isNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getCurrentSubscription,
} from '../utils/notifications';
import toast from 'react-hot-toast';

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  // Check support and current subscription status
  useEffect(() => {
    const checkStatus = async () => {
      const supported = isNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        const subscription = await getCurrentSubscription();
        setIsSubscribed(!!subscription);
      }
    };

    checkStatus();
  }, []);

  // Subscribe to push notifications
  const subscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để nhận thông báo');
      return false;
    }

    if (!isSupported) {
      toast.error('Trình duyệt của bạn không hỗ trợ thông báo');
      return false;
    }

    setLoading(true);
    try {
      const subscription = await subscribeToPushNotifications();
      
      if (!subscription) {
        toast.error('Không thể đăng ký nhận thông báo');
        return false;
      }

      // Send subscription to backend
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };

      await notificationService.subscribe(subscriptionData);
      
      setIsSubscribed(true);
      setPermission(Notification.permission);
      toast.success('Đã bật thông báo thành công');
      return true;
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error('Có lỗi khi bật thông báo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    setLoading(true);
    try {
      const success = await unsubscribeFromPushNotifications();
      
      if (success) {
        setIsSubscribed(false);
        toast.success('Đã tắt thông báo');
        return true;
      } else {
        toast.error('Không thể tắt thông báo');
        return false;
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error('Có lỗi khi tắt thông báo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe,
  };
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

