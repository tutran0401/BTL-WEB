import { Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../common';

interface StatsOverviewProps {
  stats: {
    totalUsers: number;
    totalEvents: number;
    totalRegistrations: number;
    pendingEvents: number;
    activeEvents: number;
    completedEvents: number;
  };
  usersByRole: Array<{ role: string; _count: number }>;
  eventsByCategory: Array<{ category: string; _count: number }>;
}

export default function StatsOverview({ stats, usersByRole, eventsByCategory }: StatsOverviewProps) {
  const roleLabels: Record<string, string> = {
    VOLUNTEER: 'Tình nguyện viên',
    EVENT_MANAGER: 'Quản lý sự kiện',
    ADMIN: 'Admin',
  };

  const categoryLabels: Record<string, string> = {
    TREE_PLANTING: 'Trồng cây',
    CLEANING: 'Dọn dẹp',
    CHARITY: 'Từ thiện',
    EDUCATION: 'Giáo dục',
    HEALTHCARE: 'Y tế',
    DIGITAL_LITERACY: 'Tin học',
    COMMUNITY: 'Cộng đồng',
    OTHER: 'Khác',
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng người dùng</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Tổng sự kiện</p>
              <p className="text-3xl font-bold mt-2">{stats.totalEvents}</p>
            </div>
            <Calendar className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Đăng ký tham gia</p>
              <p className="text-3xl font-bold mt-2">{stats.totalRegistrations}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Chờ duyệt</p>
              <p className="text-3xl font-bold mt-2">{stats.pendingEvents}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Event Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái sự kiện</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đang hoạt động</span>
              <span className="text-2xl font-bold text-green-600">{stats.activeEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Chờ duyệt</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.pendingEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đã hoàn thành</span>
              <span className="text-2xl font-bold text-blue-600">{stats.completedEvents}</span>
            </div>
          </div>
        </Card>

        {/* Users by Role */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Người dùng theo vai trò</h3>
          <div className="space-y-3">
            {usersByRole.map((item) => (
              <div key={item.role} className="flex justify-between items-center">
                <span className="text-gray-600">{roleLabels[item.role] || item.role}</span>
                <span className="text-xl font-bold text-gray-900">{item._count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Events by Category */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sự kiện theo danh mục</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {eventsByCategory.map((item) => (
              <div key={item.category} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{categoryLabels[item.category] || item.category}</span>
                <span className="font-semibold text-gray-900">{item._count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
