import { MessageCircle, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActiveEvent } from '../../services/dashboardService';
import EventCard from './EventCard';

interface ActiveEventsSectionProps {
    events: ActiveEvent[];
    loading?: boolean;
}

export default function ActiveEventsSection({ events, loading = false }: ActiveEventsSectionProps) {
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
                        <MessageCircle className="w-7 h-7 text-green-500" />
                        Sự kiện đang sôi nổi
                    </h2>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-12 text-center border border-green-100">
                    <MessageCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Chưa có hoạt động mới trong 24h qua</p>
                    <p className="text-gray-500 text-sm mt-2">Hãy là người đầu tiên tham gia thảo luận!</p>
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
                        <MessageCircle className="w-7 h-7 text-green-500" />
                        Sự kiện đang sôi nổi
                    </h2>
                    <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        {events.length} sự kiện có hoạt động trao đổi mới trong 24h qua
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

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-green-900 mb-1">Tham gia thảo luận</h4>
                        <p className="text-green-700 text-sm">
                            Click vào sự kiện để xem các bài viết và bình luận mới nhất, cùng chia sẻ ý kiến của bạn!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
