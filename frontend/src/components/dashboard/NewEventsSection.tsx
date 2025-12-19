import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardEvent } from '../../services/dashboardService';
import EventCard from './EventCard';

interface NewEventsSectionProps {
    events: DashboardEvent[];
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export default function NewEventsSection({
    events,
    loading = false,
    hasMore = false,
    onLoadMore,
    loadingMore = false
}: NewEventsSectionProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-7 h-7 text-blue-500" />
                        Sự kiện mới công bố
                    </h2>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-12 text-center border border-blue-100">
                    <Sparkles className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Chưa có sự kiện mới</p>
                    <p className="text-gray-500 text-sm mt-2">Hãy quay lại sau để khám phá các sự kiện mới!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-7 h-7 text-blue-500" />
                        Sự kiện mới công bố
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Khám phá các sự kiện vừa được công bố gần đây
                    </p>
                </div>
                <Link
                    to="/events"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors group"
                >
                    <span>Xem tất cả</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} variant="new" />
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loadingMore ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang tải...
                            </>
                        ) : (
                            <>
                                Xem thêm
                                <ChevronDown className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
