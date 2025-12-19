import { Play, ArrowRight, Calendar, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActiveEvent } from '../../services/dashboardService';
import EventCard from './EventCard';

interface ActiveEventsSectionProps {
    events: ActiveEvent[];
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export default function ActiveEventsSection({
    events,
    loading = false,
    hasMore = false,
    onLoadMore,
    loadingMore = false
}: ActiveEventsSectionProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 rounded w-56 animate-pulse" />
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
                        <Play className="w-7 h-7 text-green-500" />
                        Sự kiện đang diễn ra
                    </h2>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-12 text-center border border-green-100">
                    <Calendar className="w-16 h-16 text-green-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Không có sự kiện nào đang diễn ra</p>
                    <p className="text-gray-500 text-sm mt-2">Hãy khám phá các sự kiện sắp tới!</p>
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
                        <Play className="w-7 h-7 text-green-500" />
                        Sự kiện đang diễn ra
                    </h2>
                    <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        Các sự kiện đang trong thời gian diễn ra
                    </p>
                </div>
                <Link
                    to="/events"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors group"
                >
                    <span>Tham gia ngay</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} variant="active" />
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
