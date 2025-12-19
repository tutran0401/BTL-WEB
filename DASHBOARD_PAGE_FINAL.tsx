import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Users, CheckCircle, Clock, BarChart3, Award } from 'lucide-react';
import { dashboardService, DashboardResponse, VolunteerStats, ManagerStats, AdminDashboardStats } from '../../services/dashboardService';
import { Loading } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../contexts/SocketContext';
import { debounce } from '../../utils/debounce';
import toast from 'react-hot-toast';
import NewEventsSection from '../../components/dashboard/NewEventsSection';
import ActiveEventsSection from '../../components/dashboard/ActiveEventsSection';
import TrendingEventsSection from '../../components/dashboard/TrendingEventsSection';
import StatsCard from '../../components/dashboard/StatsCard';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchDashboard = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }
            const response = await dashboardService.getDashboard();
            setData(response);
        } catch (error) {
            toast.error('Không thể tải dashboard');
            console.error(error);
        } finally {
            if (!silent) {
                setLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Debounced refresh function (3 seconds delay for smoother UX)
    const debouncedRefresh = useMemo(
        () => debounce(() => {
            console.log('📊 Dashboard update triggered - refreshing silently...');
            fetchDashboard(true); // Silent refresh - no loading spinner
        }, 3000), // Increased to 3 seconds
        [fetchDashboard]
    );

    // Real-time updates via WebSocket with debouncing
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Subscribe to relevant events (all trigger debounced refresh)
        // Post events
        socket.on('post:created', debouncedRefresh);
        socket.on('post:updated', debouncedRefresh);
        socket.on('post:deleted', debouncedRefresh);

        // Comment events
        socket.on('comment:created', debouncedRefresh);
        socket.on('comment:deleted', debouncedRefresh);

        // Like events
        socket.on('like:created', debouncedRefresh);
        socket.on('like:removed', debouncedRefresh);

        // Registration events
        socket.on('registration:created', debouncedRefresh);
        socket.on('registration:approved', debouncedRefresh);
        socket.on('registration:rejected', debouncedRefresh);
        socket.on('registration:cancelled', debouncedRefresh);
        socket.on('registration:completed', debouncedRefresh);

        // Event events
        socket.on('event:approved', debouncedRefresh);
        socket.on('event:rejected', debouncedRefresh);
        socket.on('event:updated', debouncedRefresh);
        socket.on('event:deleted', debouncedRefresh);

        // Cleanup listeners on unmount
        return () => {
            socket.off('post:created', debouncedRefresh);
            socket.off('post:updated', debouncedRefresh);
            socket.off('post:deleted', debouncedRefresh);
            socket.off('comment:created', debouncedRefresh);
            socket.off('comment:deleted', debouncedRefresh);
            socket.off('like:created', debouncedRefresh);
            socket.off('like:removed', debouncedRefresh);
            socket.off('registration:created', debouncedRefresh);
            socket.off('registration:approved', debouncedRefresh);
            socket.off('registration:rejected', debouncedRefresh);
            socket.off('registration:cancelled', debouncedRefresh);
            socket.off('registration:completed', debouncedRefresh);
            socket.off('event:approved', debouncedRefresh);
            socket.off('event:rejected', debouncedRefresh);
            socket.off('event:updated', debouncedRefresh);
            socket.off('event:deleted', debouncedRefresh);
        };
    }, [socket, isConnected, debouncedRefresh]);

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
                        onClick={() => fetchDashboard(false)}
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
            {/* Silent refresh indicator - subtle top bar */}
            {isRefreshing && (
                <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
            )}

            <div
                className="container mx-auto px-4 py-8 space-y-10 transition-opacity duration-300"
                style={{ opacity: isRefreshing ? 0.7 : 1 }}
            >
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

                {/* Trending Events Section - NOW FIRST! */}
                <TrendingEventsSection events={data.trendingEvents} loading={loading} />

                {/* New Events Section */}
                <NewEventsSection events={data.newEvents} loading={loading} />

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                {/* Active Events Section */}
                <ActiveEventsSection events={data.activeEvents} loading={loading} />
            </div>
        </div>
    );
}
