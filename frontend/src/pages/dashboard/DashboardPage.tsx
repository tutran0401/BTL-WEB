import { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, Clock, BarChart3, Award } from 'lucide-react';
import { dashboardService, DashboardResponse, VolunteerStats, ManagerStats, AdminDashboardStats } from '../../services/dashboardService';
import { Loading } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import NewEventsSection from '../../components/dashboard/NewEventsSection';
import ActiveEventsSection from '../../components/dashboard/ActiveEventsSection';
import TrendingEventsSection from '../../components/dashboard/TrendingEventsSection';
import StatsCard from '../../components/dashboard/StatsCard';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboard();
      setData(response);
    } catch (error) {
      toast.error('Không thể tải dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatsCards = () => {
    if (!data?.userStats) return null;

    const role = user?.role;

    if (role === 'VOLUNTEER') {
      const stats = data.userStats as VolunteerStats;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Calendar}
            label="Tổng số đăng ký"
            value={stats.totalRegistrations}
            color="blue"
          />
          <StatsCard
            icon={CheckCircle}
            label="Sự kiện hoàn thành"
            value={stats.completedEvents}
            color="green"
          />
          <StatsCard
            icon={Clock}
            label="Sự kiện sắp tới"
            value={stats.upcomingEvents}
            color="purple"
          />
          <StatsCard
            icon={Award}
            label="Giờ tình nguyện"
            value={stats.totalHours}
            color="orange"
          />
        </div>
      );
    }

    if (role === 'EVENT_MANAGER') {
      const stats = data.userStats as ManagerStats;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Calendar}
            label="Tổng sự kiện"
            value={stats.totalEvents}
            color="blue"
          />
          <StatsCard
            icon={CheckCircle}
            label="Đã duyệt"
            value={stats.approvedEvents}
            color="green"
          />
          <StatsCard
            icon={Clock}
            label="Chờ duyệt"
            value={stats.pendingEvents}
            color="orange"
          />
          <StatsCard
            icon={Users}
            label="Người tham gia"
            value={stats.totalParticipants}
            color="purple"
          />
        </div>
      );
    }

    if (role === 'ADMIN') {
      const stats = data.userStats as AdminDashboardStats;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Users}
            label="Tổng người dùng"
            value={stats.totalUsers}
            color="blue"
          />
          <StatsCard
            icon={Calendar}
            label="Tổng sự kiện"
            value={stats.totalEvents}
            color="green"
          />
          <StatsCard
            icon={BarChart3}
            label="Lượt đăng ký"
            value={stats.totalRegistrations}
            color="purple"
          />
          <StatsCard
            icon={Clock}
            label="Chờ duyệt"
            value={stats.pendingEvents}
            color="orange"
          />
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải dashboard..." />;
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-600">Không thể tải dữ liệu dashboard</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Chào mừng trở lại, {user?.fullName}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Đây là tổng quan về các hoạt động tình nguyện và sự kiện nổi bật
          </p>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 text-sm font-medium text-gray-500">
              Khám phá sự kiện
            </span>
          </div>
        </div>

        {/* New Events Section */}
        <NewEventsSection events={data.newEvents} loading={loading} />

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Active Events Section */}
        <ActiveEventsSection events={data.activeEvents} loading={loading} />

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Trending Events Section */}
        <TrendingEventsSection events={data.trendingEvents} loading={loading} />

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            Dashboard được cập nhật theo thời gian thực. Dữ liệu được tổng hợp dựa trên hoạt động của bạn và cộng đồng.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Lần cập nhật cuối: {new Date().toLocaleString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}
