import { useState, useEffect } from 'react';
import { dashboardService, AdminStats } from '../../services/dashboardService';
import { StatsOverview, UserManagement, EventApproval } from '../../components/admin';
import toast from 'react-hot-toast';
import { useRealtimeEvents } from '../../hooks/useRealtimeUpdates';

type TabType = 'overview' | 'users' | 'events';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAdminDashboard();
      setStats(data);
    } catch (error: any) {
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Callback để reload stats sau khi approve/reject event
  const handleEventStatusChanged = () => {
    loadDashboardData(); // Reload stats để cập nhật số lượng pending
  };

  // Real-time updates for event approvals
  useRealtimeEvents({
    onEventApproved: (data) => {
      console.log('✅ Admin received event approved:', data);
      // Reload dashboard stats to reflect changes
      loadDashboardData();
    }
  });

  const handleExport = async (type: 'events' | 'users', format: 'json' | 'csv') => {
    try {
      toast.loading('Đang xuất dữ liệu...');
      
      const blob = type === 'events' 
        ? await dashboardService.exportEvents(format)
        : await dashboardService.exportUsers(format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Xuất dữ liệu thành công');
    } catch (error: any) {
      toast.dismiss();
      toast.error('Xuất dữ liệu thất bại');
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Tổng quan', icon: '📊' },
    { id: 'users' as TabType, label: 'Quản lý User', icon: '👥' },
    { id: 'events' as TabType, label: 'Duyệt sự kiện', icon: '📅' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Quản lý hệ thống và theo dõi hoạt động</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.id === 'events' && stats && stats.stats.pendingEvents > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  {stats.stats.pendingEvents}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && stats && (
          <>
            <StatsOverview
              stats={stats.stats}
              usersByRole={stats.usersByRole}
              eventsByCategory={stats.eventsByCategory}
            />

            {/* Export Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Xuất dữ liệu</h3>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Danh sách sự kiện:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport('events', 'json')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => handleExport('events', 'csv')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      CSV
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Danh sách người dùng:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport('users', 'json')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => handleExport('users', 'csv')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Người dùng mới nhất
                </h3>
                <div className="space-y-3">
                  {stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'EVENT_MANAGER' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'ADMIN' ? 'Admin' :
                           user.role === 'EVENT_MANAGER' ? 'Quản lý' : 'TNV'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sự kiện mới nhất
                </h3>
                <div className="space-y-3">
                  {stats.recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500">
                          {event.manager.fullName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          event.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status === 'APPROVED' ? 'Đã duyệt' :
                           event.status === 'PENDING' ? 'Chờ duyệt' :
                           event.status === 'REJECTED' ? 'Từ chối' : event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && <UserManagement />}
        
        {activeTab === 'events' && <EventApproval onEventStatusChanged={handleEventStatusChanged} />}
      </div>
    </div>
  );
}

