import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Heart, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import NotificationButton from './NotificationButton';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link to="/events" className={getLinkClasses('/events')}>
            Sự kiện
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
                Dashboard
              </Link>

              {user?.role === 'VOLUNTEER' && (
                <Link to="/my-events" className={getLinkClasses('/my-events')}>
                  Sự kiện của tôi
                </Link>
              )}

              {(user?.role === 'EVENT_MANAGER' || user?.role === 'ADMIN') && (
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
              
              {/* Notification Bell Button */}
              <NotificationButton />

              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition">
                  <User className="w-5 h-5" />
                  <span>{user?.fullName}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    <span>Hồ sơ</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
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
            <Link
              to="/events"
              className={getMobileLinkClasses('/events')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sự kiện
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={getMobileLinkClasses('/dashboard')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
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

                <Link
                  to="/profile"
                  className={getMobileLinkClasses('/profile')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hồ sơ
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-red-600 hover:text-red-700 transition text-left"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition"
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

