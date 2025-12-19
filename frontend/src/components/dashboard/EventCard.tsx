import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, MessageCircle, TrendingUp, Clock } from 'lucide-react';
import { DashboardEvent, ActiveEvent, TrendingEvent } from '../../services/dashboardService';
import { Card } from '../common';
import { getImageUrl } from '../../lib/api';

interface EventCardProps {
    event: DashboardEvent | ActiveEvent | TrendingEvent;
    variant?: 'new' | 'active' | 'trending';
    compact?: boolean;
}

export default function EventCard({ event, variant = 'new', compact = false }: EventCardProps) {
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

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            TREE_PLANTING: 'bg-green-100 text-green-700',
            CLEANING: 'bg-blue-100 text-blue-700',
            CHARITY: 'bg-pink-100 text-pink-700',
            EDUCATION: 'bg-purple-100 text-purple-700',
            HEALTHCARE: 'bg-red-100 text-red-700',
            DIGITAL_LITERACY: 'bg-indigo-100 text-indigo-700',
            COMMUNITY: 'bg-yellow-100 text-yellow-700',
            OTHER: 'bg-gray-100 text-gray-700',
        };
        return colors[category] || colors.OTHER;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const renderVariantBadge = () => {
        if (variant === 'trending') {
            return (
                <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-semibold shadow-lg">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Hot</span>
                    </div>
                </div>
            );
        }

        if (variant === 'active') {
            // For active (ongoing) events, always show the badge
            return (
                <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-semibold shadow-lg">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Đang diễn ra</span>
                    </div>
                </div>
            );
        }

        if (variant === 'new') {
            const daysSinceCreated = Math.floor(
                (Date.now() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceCreated <= 3) {
                return (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-semibold shadow-lg">
                            Mới
                        </div>
                    </div>
                );
            }
        }

        return null;
    };

    const renderGrowthIndicator = () => {
        if (variant === 'trending') {
            const trendingEvent = event as TrendingEvent;
            if (trendingEvent.growthIndicator) {
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>{trendingEvent.growthIndicator}</span>
                    </div>
                );
            }
        }
        return null;
    };

    const renderDiscussionStats = () => {
        // Discussion stats removed for active (ongoing) events
        // Active events now only show basic info
        return null;
    };

    return (
        <Link to={`/events/${event.id}`} className="block group h-full">
            <Card hover padding="none" className="h-full flex flex-col overflow-hidden transition-all duration-300 group-hover:shadow-xl relative">
                {renderVariantBadge()}

                {/* Image - Fixed size container */}
                <div className="w-full h-48 overflow-hidden bg-gray-200 flex-shrink-0">
                    {event.imageUrl ? (
                        <img
                            src={getImageUrl(event.imageUrl)}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Calendar className="w-16 h-16" />
                        </div>
                    )}

                </div>

                {/* Content - Flex grow to fill remaining space */}
                <div className="flex-1 flex flex-col space-y-3 p-4">
                    {/* Category */}
                    <span className={`inline-block self-start px-3 py-1 ${getCategoryColor(event.category)} text-xs font-semibold rounded-full`}>
                        {getCategoryLabel(event.category)}
                    </span>

                    {/* Title */}
                    <h3 className={`font-bold text-gray-900 group-hover:text-primary-600 transition-colors ${compact ? 'text-base line-clamp-1' : 'text-lg line-clamp-2'}`}>
                        {event.title}
                    </h3>

                    {/* Description - Always show, clamp to 2 lines */}
                    <p className="text-gray-600 text-sm line-clamp-2 flex-grow">
                        {event.description}
                    </p>

                    {/* Growth Indicator (Trending only) */}
                    {renderGrowthIndicator()}

                    {/* Meta Info */}
                    <div className="space-y-2 pt-2">
                        {/* Manager */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{event.manager.fullName}</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{formatDate(event.startDate)}</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-sm">
                            <Users className="w-4 h-4 text-primary-500" />
                            <span className="font-medium text-gray-900">{event._count.registrations}</span>
                            <span className="text-gray-500">tham gia</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-900">{event._count.posts}</span>
                            <span className="text-gray-500">bài viết</span>
                        </div>
                    </div>

                    {/* Discussion Stats (Active events only) */}
                    {renderDiscussionStats()}
                </div>
            </Card>
        </Link>
    );
}
