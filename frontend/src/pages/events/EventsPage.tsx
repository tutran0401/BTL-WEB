import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import { eventService, Event } from '../../services/eventService';
import { getImageUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { debounce } from '../../utils/debounce';

const categories = [
  { value: '', label: 'Tất cả' },
  { value: 'TREE_PLANTING', label: 'Trồng cây' },
  { value: 'CLEANING', label: 'Dọn dẹp' },
  { value: 'CHARITY', label: 'Từ thiện' },
  { value: 'EDUCATION', label: 'Giáo dục' },
  { value: 'HEALTHCARE', label: 'Y tế' },
  { value: 'DIGITAL_LITERACY', label: 'Tin học' },
  { value: 'COMMUNITY', label: 'Cộng đồng' },
  { value: 'OTHER', label: 'Khác' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Actual search term used
  const [searchError, setSearchError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('eventSearchHistory');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // Save search to history
  const saveSearchToHistory = (searchText: string) => {
    if (!searchText.trim()) return;

    const updated = [searchText, ...recentSearches.filter(s => s !== searchText)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('eventSearchHistory', JSON.stringify(updated));
  };

  // Validate search input
  const validateSearch = (value: string): boolean => {
    setSearchError('');

    // Allow empty search
    if (!value.trim()) return true;

    // Min length (2 characters)
    if (value.trim().length < 2) {
      setSearchError('Vui lòng nhập ít nhất 2 ký tự');
      return false;
    }

    // Max length already handled by maxLength attribute
    return true;
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    validateSearch(value);

    // Show suggestions if typing and have history
    if (value.trim() && recentSearches.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Fetch events function with silent mode support
  const fetchEvents = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const params: any = { page, limit: 12 };
      if (category) params.category = category;
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await eventService.getAllEvents(params);
      setEvents(data.events);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      if (!silent) {
        toast.error('Không thể tải danh sách sự kiện');
      }
      console.error('Fetch events error:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, [page, category, searchTerm, startDate, endDate]);

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Debounced refresh for real-time updates (2 seconds)
  const debouncedRefresh = useMemo(
    () => debounce(() => {
      console.log('🔄 Event update triggered - refreshing silently...');
      fetchEvents(true); // Silent refresh
    }, 2000),
    [fetchEvents]
  );

  // Validate date range
  const validateDateRange = useCallback((start: string, end: string) => {
    if (start && end && new Date(start) > new Date(end)) {
      setDateError('Ngày kết thúc phải sau ngày bắt đầu');
      return false;
    }
    setDateError('');
    return true;
  }, []);

  // Handle date changes with validation
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    validateDateRange(value, endDate);
    setPage(1);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    validateDateRange(startDate, value);
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setSearchTerm('');
    setSearchError('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setDateError('');
    setPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || category || startDate || endDate;

  // Real-time updates for events
  useRealtimeUpdates({
    onEventApproved: (data) => {
      console.log('🎉 New event approved:', data);
      debouncedRefresh();
    },

    onEventUpdated: (data) => {
      console.log('🔄 Event updated:', data);
      if (data.event) {
        // Optimistic update
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === data.event.id ? data.event : event
          )
        );
      }
      debouncedRefresh();
    },

    onEventDeleted: (data) => {
      console.log('🗑️ Event deleted:', data);
      if (data.eventId) {
        // Optimistic removal
        setEvents(prevEvents =>
          prevEvents.filter(event => event.id !== data.eventId)
        );
      }
    },

    onEventRejected: (data) => {
      console.log('❌ Event rejected:', data);
      if (data.eventId) {
        // Optimistic removal
        setEvents(prevEvents =>
          prevEvents.filter(event => event.id !== data.eventId)
        );
      }
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before search
    if (!validateSearch(search)) {
      return;
    }

    const trimmed = search.trim();

    // Update search term to trigger fetch
    setSearchTerm(trimmed);
    setPage(1);
    setShowSuggestions(false);

    // Save to history if not empty
    if (trimmed) {
      saveSearchToHistory(trimmed);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearch(suggestion);
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setPage(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (cat: string) => {
    return categories.find(c => c.value === cat)?.label || cat;
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

  const getEventStatusBadge = (event: Event) => {
    if (event.status !== 'APPROVED') return null;

    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          Đã kết thúc
        </span>
      );
    } else if (startDate <= now && endDate >= now) {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium rounded-full">
          Đang diễn ra
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Sắp diễn ra
        </span>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Silent refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
      )}

      {/* Content with smooth opacity transition */}
      <div
        className="transition-opacity duration-300"
        style={{ opacity: isRefreshing ? 0.7 : 1 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Khám phá sự kiện tình nguyện
          </h1>
          <p className="text-gray-600 text-lg">
            Tham gia các hoạt động tình nguyện ý nghĩa và tạo nên sự thay đổi tích cực
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sự kiện..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => {
                      if (search.trim() && recentSearches.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click on suggestions
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    maxLength={200}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${searchError ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  {/* Clear button */}
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setSearchError('');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
                      title="Xóa tìm kiếm"
                    >
                      ×
                    </button>
                  )}

                  {/* Recent searches suggestions */}
                  {showSuggestions && recentSearches.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                        Tìm kiếm gần đây
                      </div>
                      {recentSearches
                        .filter(s => s.toLowerCase().includes(search.toLowerCase()))
                        .map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <Search className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{suggestion}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Search error */}
                {searchError && (
                  <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{searchError}</span>
                  </div>
                )}
              </div>

              <div className="md:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white cursor-pointer hover:border-gray-400 transition-colors"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium whitespace-nowrap"
              >
                Tìm kiếm
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {(startDate || endDate || hasActiveFilters) && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            {/* Date validation error */}
            {dateError && (
              <div className="text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span>
                <span>{dateError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy sự kiện
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc tìm kiếm để xem các sự kiện khác
            </p>
          </div>
        ) : (
          <>
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition group"
                >
                  {/* Event Image */}
                  <div className="h-48 overflow-hidden bg-gray-200">
                    {event.imageUrl ? (
                      <img
                        src={getImageUrl(event.imageUrl)}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Calendar className="w-16 h-16" />
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 ${getCategoryColor(event.category)} text-xs font-medium rounded-full`}>
                        {getCategoryLabel(event.category)}
                      </span>
                      {getEventStatusBadge(event)}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition">
                      {event.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {event._count?.registrations || 0}
                          {event.maxParticipants && ` / ${event.maxParticipants}`} người
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded-lg ${page === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}