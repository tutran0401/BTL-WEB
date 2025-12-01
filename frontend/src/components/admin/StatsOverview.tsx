import { AdminStats } from '../../services/dashboardService';

interface StatsOverviewProps {
  stats: AdminStats['stats'];
  usersByRole: AdminStats['usersByRole'];
  eventsByCategory: AdminStats['eventsByCategory'];
}

export default function StatsOverview({ stats, usersByRole, eventsByCategory }: StatsOverviewProps) {
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      EVENT_MANAGER: 'Quản lý sự kiện',
      VOLUNTEER: 'Tình nguyện viên'
    };
    return labels[role] || role;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      EDUCATION: 'Giáo dục',
      ENVIRONMENT: 'Môi trường',
      HEALTH: 'Sức khỏe',
      COMMUNITY: 'Cộng đồng',
      OTHER: 'Khác'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng sự kiện</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đăng ký</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRegistrations}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingEvents}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Người dùng theo vai trò</h3>
          <div className="space-y-4">
            {usersByRole.map((item) => {
              const percentage = (item._count / stats.totalUsers) * 100;
              return (
                <div key={item.role}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getRoleLabel(item.role)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item._count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.role === 'ADMIN'
                          ? 'bg-red-500'
                          : item.role === 'EVENT_MANAGER'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sự kiện theo danh mục</h3>
          <div className="space-y-4">
            {eventsByCategory.map((item) => {
              const totalApprovedEvents = eventsByCategory.reduce((sum, cat) => sum + cat._count, 0);
              const percentage = (item._count / totalApprovedEvents) * 100;
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getCategoryLabel(item.category)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item._count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.category === 'EDUCATION'
                          ? 'bg-blue-500'
                          : item.category === 'ENVIRONMENT'
                          ? 'bg-green-500'
                          : item.category === 'HEALTH'
                          ? 'bg-red-500'
                          : item.category === 'COMMUNITY'
                          ? 'bg-purple-500'
                          : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
