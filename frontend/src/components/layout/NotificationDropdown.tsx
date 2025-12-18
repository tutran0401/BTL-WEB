import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react'; 
import { notificationService, Notification } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications'; 

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false); 
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { user } = useAuthStore();

    // Logic mới từ NotificationButton (Push Notification) 
    const { 
        isSupported, 
        isSubscribed, 
        permission, 
        loading: pushLoading, 
        subscribe, 
        unsubscribe 
    } = useNotifications();

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getMyNotifications(1, 5);
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }, []);

    // Socket listeners...
    useEffect(() => {
        if (!socket || !isConnected || !user) return;
        const handleNotification = (notification: any) => {
            setNotifications(prev => [notification, ...prev.slice(0, 4)]);
            setUnreadCount(prev => prev + 1);
            toast.success(notification.message, { duration: 5000 });
        };
        socket.on(`user:${user.id}:notification`, handleNotification);
        socket.on('notification', handleNotification);
        return () => {
            socket.off(`user:${user.id}:notification`, handleNotification);
            socket.off('notification', handleNotification);
        };
    }, [socket, isConnected, user]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('Đã đánh dấu tất cả là đã đọc');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
        if (notification.type === 'new_registration' && user?.role === 'EVENT_MANAGER') {
            navigate('/manage-events');
        } else if (notification.data?.eventId) {
            navigate(`/events/${notification.data.eventId}`);
        } else if (notification.data?.url) {
            navigate(notification.data.url);
        }
        setIsOpen(false);
    };

    const handlePushToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn dropdown bị đóng khi bấm nút này
        
        if (isSubscribed) {
            const success = await unsubscribe();
            if (!success) toast.error('Không thể tắt thông báo');
        } else {
            if (permission === 'denied') {
                toast.error('Bạn đã chặn thông báo. Vui lòng mở khóa trong cài đặt trình duyệt.');
                return;
            }
            const success = await subscribe();
            if (!success) toast.error('Không thể bật thông báo');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Nút chuông trên Navbar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">Thông báo</h3>
                           
                            {isSupported && (
                                <button
                                    onClick={handlePushToggle}
                                    disabled={pushLoading}
                                    title={isSubscribed ? 'Tắt thông báo trình duyệt' : 'Bật thông báo trình duyệt'}
                                    className={`p-1.5 rounded-full transition-all ${
                                        isSubscribed 
                                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                    }`}
                                >
                                    {pushLoading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : isSubscribed ? (
                                        <Bell className="w-3.5 h-3.5 fill-current" />
                                    ) : (
                                        <BellOff className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={loading}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap ml-2"
                            >
                                {loading ? 'Đang xử lý...' : 'Đánh dấu đã đọc'}
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>Không có thông báo nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {formatDate(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            Xem tất cả
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}