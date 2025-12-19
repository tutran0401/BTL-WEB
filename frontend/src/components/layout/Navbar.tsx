import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Heart, Menu, X, User, LogOut, Bell, BellOff } from 'lucide-react';
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../../hooks/useNotifications';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe } = useNotifications();

  // Helper function to check if current path is active
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Get active link classes
  const getLinkClasses = (path: string) => {
    const baseClasses = "transition font-medium";
    const activeClasses = "text-primary-600 border-b-2 border-primary-600 pb-1";
    const inactiveClasses = "text-gray-700 hover:text-primary-600";

    return `${baseClasses} ${isActivePath(path) ? activeClasses : inactiveClasses}`;
  };

  // Get mobile link classes
  const getMobileLinkClasses = (path: string) => {
    const baseClasses = "transition font-medium py-2 px-3 rounded-lg";
    const activeClasses = "bg-primary-50 text-primary-600";
    const inactiveClasses = "text-gray-700 hover:bg-gray-50 hover:text-primary-600";

    return `${baseClasses} ${isActivePath(path) ? activeClasses : inactiveClasses}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationToggle = async () => {
    if (!isSupported) return;

    if (isSubscribed) {
      const success = await unsubscribe();
      if (!success) {
        toast.error('Không thể tắt thông báo');
      }
    } else {
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
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-primary-600" fill="currentColor" />
            <span className="text-xl font-bold text-gray-900">VolunteerHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
                  Dashboard
                </Link>

                <Link to="/events" className={getLinkClasses('/events')}>
                  Sự kiện
                </Link>

                {user?.role === 'VOLUNTEER' && (
                  <Link to="/my-events" className={getLinkClasses('/my-events')}>
                    Sự kiện của tôi
                  </Link>
                )}

                {(user?.role === 'EVENT_MANAGER') && (
                  <Link to="/manage-events" className={getLinkClasses('/manage-events')}>
                    Quản lý sự kiện
                  </Link>
                )}

                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className={getLinkClasses('/admin')}>
                    Admin
                  </Link>
                )}

                <NotificationDropdown />

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition">
                    <User className="w-5 h-5" />
                    <span>{user?.fullName}</span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="w-4 h-4" />
                      <span>Hồ sơ</span>
                    </Link>

                    {/* Notification Toggle */}
                    {isSupported && (
                      <button
                        onClick={handleNotificationToggle}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full transition disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
                        ) : isSubscribed ? (
                          <Bell className="w-4 h-4 text-primary-600 fill-current" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                        <span className={isSubscribed ? 'text-primary-600' : ''}>
                          {isSubscribed ? 'Tắt thông báo' : 'Bật thông báo'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/events" className={getLinkClasses('/events')}>
                  Sự kiện
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className={getMobileLinkClasses('/dashboard')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/events"
                    className={getMobileLinkClasses('/events')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sự kiện
                  </Link>

                  {user?.role === 'VOLUNTEER' && (
                    <Link
                      to="/my-events"
                      className={getMobileLinkClasses('/my-events')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sự kiện của tôi
                    </Link>
                  )}

                  {(user?.role === 'EVENT_MANAGER' || user?.role === 'ADMIN') && (
                    <Link
                      to="/manage-events"
                      className={getMobileLinkClasses('/manage-events')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quản lý sự kiện
                    </Link>
                  )}

                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className={getMobileLinkClasses('/admin')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}

                  {/* Notification Dropdown in Mobile */}
                  <div className="px-3 py-2">
                    <NotificationDropdown />
                  </div>

                  <Link
                    to="/profile"
                    className={getMobileLinkClasses('/profile')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>

                  {/* Notification Toggle in Mobile */}
                  {isSupported && (
                    <button
                      onClick={handleNotificationToggle}
                      disabled={loading}
                      className={getMobileLinkClasses('') + " disabled:opacity-50"}
                    >
                      <div className="flex items-center space-x-2">
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
                        ) : isSubscribed ? (
                          <Bell className="w-4 h-4 text-primary-600 fill-current" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                        <span className={isSubscribed ? 'text-primary-600' : ''}>
                          {isSubscribed ? 'Tắt thông báo' : 'Bật thông báo'}
                        </span>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className={getMobileLinkClasses('') + " text-red-600 hover:text-red-700"}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/events"
                    className={getMobileLinkClasses('/events')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sự kiện
                  </Link>
                  <Link
                    to="/login"
                    className={getMobileLinkClasses('')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

