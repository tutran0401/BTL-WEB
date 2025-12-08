import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { Button } from '../common';
import toast from 'react-hot-toast';

export default function NotificationButton() {
  const { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe } = useNotifications();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  const handleClick = async () => {
    if (isSubscribed) {
      // Unsubscribe
      const success = await unsubscribe();
      if (!success) {
        toast.error('Không thể tắt thông báo');
      }
    } else {
      // Subscribe
      if (permission === 'denied') {
        toast.error('Bạn đã chặn thông báo. Vui lòng cho phép trong cài đặt trình duyệt.');
        return;
      }
      
      const success = await subscribe();
      if (!success) {
        toast.error('Không thể bật thông báo');
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`p-2 rounded-lg transition-colors ${
          isSubscribed
            ? 'text-primary-600 hover:bg-primary-50'
            : 'text-gray-600 hover:bg-gray-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isSubscribed ? 'Tắt thông báo' : 'Bật thông báo'}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
        ) : isSubscribed ? (
          <Bell className="w-5 h-5 fill-current" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && !loading && (
        <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-50">
          {isSubscribed ? 'Tắt thông báo' : 'Bật thông báo'}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      )}
    </div>
  );
}

