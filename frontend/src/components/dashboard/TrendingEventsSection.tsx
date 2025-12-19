import { TrendingUp, ArrowRight, Flame, Award, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrendingEvent } from '../../services/dashboardService';
import EventCard from './EventCard';

interface TrendingEventsSectionProps {
    events: TrendingEvent[];
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export default function TrendingEventsSection({
    events,
    loading = false,
    hasMore = false,
    onLoadMore,
    loadingMore = false
}: TrendingEventsSectionProps) {
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
                        <Flame className="w-7 h-7 text-orange-500" />
                        Sự kiện thu hút
                    </h2>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-12 text-center border border-orange-100">
                    <Flame className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Chưa có sự kiện nổi bật</p>
                    <p className="text-gray-500 text-sm mt-2">Các sự kiện đang tích lũy mức độ tương tác!</p>
                </div>
            </div>
        );
    }

    // Get top 3 for podium display
    const topThree = events.slice(0, 3);
    const remaining = events.slice(3);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Flame className="w-7 h-7 text-orange-500 animate-pulse" />
                        Sự kiện thu hút
                    </h2>
                    <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        Top các sự kiện có mức độ tương tác tăng nhanh nhất
                    </p>
                </div>
                <Link
                    to="/events"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors group"
                >
                    <span>Khám phá</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Top 3 Podium (if we have at least 3 events) */}
            {topThree.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* 2nd Place */}
                    <div className="md:order-1 order-2">
                        <div className="relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-full shadow-lg border-4 border-white">
                                    <Award className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="pt-8">
                                <EventCard event={topThree[1]} variant="trending" />
                            </div>
                        </div>
                    </div>

                    {/* 1st Place (Highlighted) - GOLD MEDAL */}
                    <div className="md:order-2 order-1">
                        <div className="relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 text-white rounded-full shadow-xl border-4 border-white">
                                    <Award className="w-8 h-8" />
                                </div>
                            </div>
                            <div className="pt-8">
                                <div className="ring-2 ring-yellow-300 rounded-lg shadow-lg overflow-hidden">
                                    <EventCard event={topThree[0]} variant="trending" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="md:order-3 order-3">
                        <div className="relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-full shadow-lg border-4 border-white">
                                    <Award className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="pt-8">
                                <EventCard event={topThree[2]} variant="trending" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remaining Events (Regular Grid) */}
            {(topThree.length < 3 || remaining.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topThree.length < 3 && topThree.map((event, index) => (
                        <div key={event.id} className="relative">
                            {index === 0 && (
                                <div className="absolute -top-3 -right-3 z-10">
                                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-white rounded-full shadow-lg">
                                        <span className="font-bold text-sm">#{index + 1}</span>
                                    </div>
                                </div>
                            )}
                            <EventCard event={event} variant="trending" />
                        </div>
                    ))}
                    {remaining.map((event) => (
                        <EventCard key={event.id} event={event} variant="trending" />
                    ))}

                </div>
            )}

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
