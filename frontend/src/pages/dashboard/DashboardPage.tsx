import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, Users, MessageCircle } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { eventService, Event } from '../../services/eventService';
import { Card, Loading } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard();
      setStats(data.stats);
      setTrendingEvents(data.trendingEvents || []);
    } catch (error) {
      toast.error('Không thể tải dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      TREE_PLANTING: 'Trồng cây',
      CLEANING: 'Dọn dẹp',
      CHARITY: 'Từ thiện',
      EDUCATION: 'Giáo dục',
      HEALTHCARE: 'Y tế',
      DIGITAL_LITERACY: 'Tin học',
      COMMUNITY: 'Cộng đồng',
      OTHER: 'Khác',
    };
    return labels[category] || category;
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải dashboard..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Đây là tổng quan về các hoạt động tình nguyện
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng sự kiện</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalEvents || 0}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Sự kiện đang diễn ra</p>
              <p className="text-3xl font-bold mt-2">{stats?.activeEvents || 0}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Tham gia</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalParticipants || 0}</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Bài viết</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalPosts || 0}</p>
            </div>
            <MessageCircle className="w-12 h-12 text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Trending Events */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🔥 Sự kiện nổi bật</h2>
          <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium">
            Xem tất cả →
          </Link>
        </div>

        {trendingEvents.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có sự kiện nổi bật</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card hover className="h-full">
                  {event.imageUrl && (
                    <div className="w-full h-48 overflow-hidden rounded-t-lg -mt-6 -mx-6 mb-4">
                      <img
                        src={getImageUrl(event.imageUrl)}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      {getCategoryLabel(event.category)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event._count?.registrations || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{event._count?.posts || 0}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user?.role === 'VOLUNTEER' && (
          <>
            <Link to="/events">
              <Card hover className="text-center py-8">
                <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Khám phá sự kiện
                </h3>
                <p className="text-gray-600 text-sm">
                  Tìm và đăng ký các sự kiện tình nguyện
                </p>
              </Card>
            </Link>
            <Link to="/my-events">
              <Card hover className="text-center py-8">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sự kiện của tôi
                </h3>
                <p className="text-gray-600 text-sm">
                  Xem các sự kiện đã đăng ký
                </p>
              </Card>
            </Link>
          </>
        )}

        {user?.role === 'EVENT_MANAGER' && (
          <>
            <Link to="/manage-events">
              <Card hover className="text-center py-8">
                <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quản lý sự kiện
                </h3>
                <p className="text-gray-600 text-sm">
                  Tạo và quản lý sự kiện của bạn
                </p>
              </Card>
            </Link>
          </>
        )}

        {user?.role === 'ADMIN' && (
          <Link to="/admin">
            <Card hover className="text-center py-8">
              <Users className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Admin Dashboard
              </h3>
              <p className="text-gray-600 text-sm">
                Quản lý hệ thống
              </p>
            </Card>
          </Link>
        )}

        <Link to="/profile">
          <Card hover className="text-center py-8">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hồ sơ cá nhân
            </h3>
            <p className="text-gray-600 text-sm">
              Xem và chỉnh sửa thông tin
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}

