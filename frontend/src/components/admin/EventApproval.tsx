import { useState, useEffect } from 'react';
import { eventService, Event } from '../../services/eventService';
import toast from 'react-hot-toast';

interface EventApprovalProps {
  onEventStatusChanged?: () => void;
}

export default function EventApproval({ onEventStatusChanged }: EventApprovalProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const loadPendingEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents({ status: 'PENDING' });
      setEvents(data.events);
    } catch (error: any) {
      toast.error('Không thể tải danh sách sự kiện chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    if (!confirm('Bạn có chắc muốn duyệt sự kiện này?')) return;

    try {
      setUpdatingEventId(eventId);
      await eventService.updateEventStatus(eventId, 'APPROVED');
      toast.success('Đã duyệt sự kiện');
      loadPendingEvents();
      // Gọi callback để cập nhật stats trong dashboard
      if (onEventStatusChanged) {
        onEventStatusChanged();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Duyệt sự kiện thất bại');
    } finally {
      setUpdatingEventId(null);
    }
  };

  const handleReject = async (eventId: string) => {
    if (!confirm('Bạn có chắc muốn từ chối sự kiện này?')) return;

    try {
      setUpdatingEventId(eventId);
      await eventService.updateEventStatus(eventId, 'REJECTED');
      toast.success('Đã từ chối sự kiện');
      loadPendingEvents();
      // Gọi callback để cập nhật stats trong dashboard
      if (onEventStatusChanged) {
        onEventStatusChanged();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Từ chối sự kiện thất bại');
    } finally {
      setUpdatingEventId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryBadge = (category: string) => {
    const config: Record<string, { label: string; class: string }> = {
      EDUCATION: { label: 'Giáo dục', class: 'bg-blue-100 text-blue-800' },
      ENVIRONMENT: { label: 'Môi trường', class: 'bg-green-100 text-green-800' },
      HEALTH: { label: 'Sức khỏe', class: 'bg-red-100 text-red-800' },
      COMMUNITY: { label: 'Cộng đồng', class: 'bg-purple-100 text-purple-800' },
      OTHER: { label: 'Khác', class: 'bg-gray-100 text-gray-800' }
    };
    const { label, class: className } = config[category] || { label: category, class: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Duyệt sự kiện ({events.length})
          </h2>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Không có sự kiện chờ duyệt
            </h3>
            <p className="text-gray-600">
              Tất cả sự kiện đã được xử lý
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex gap-6">
                  {/* Event Image */}
                  {event.imageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryBadge(event.category)}
                          {event.manager && (
                            <span className="text-sm text-gray-600">
                              Quản lý: {event.manager.fullName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>📍 Địa điểm:</strong> {event.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>📅 Bắt đầu:</strong> {formatDate(event.startDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>📅 Kết thúc:</strong> {formatDate(event.endDate)}
                        </p>
                      </div>
                      <div>
                        {event.maxParticipants && (
                          <p className="text-sm text-gray-600">
                            <strong>👥 Số lượng:</strong> {event.maxParticipants} người
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <strong>🕐 Tạo lúc:</strong> {formatDate(event.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <button
                        onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {selectedEvent?.id === event.id ? 'Ẩn mô tả' : 'Xem mô tả'}
                      </button>
                      {selectedEvent?.id === event.id && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {event.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(event.id)}
                        disabled={updatingEventId !== null}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updatingEventId === event.id ? 'Đang xử lý...' : '✓ Duyệt'}
                      </button>
                      <button
                        onClick={() => handleReject(event.id)}
                        disabled={updatingEventId !== null}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updatingEventId === event.id ? 'Đang xử lý...' : '✗ Từ chối'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
