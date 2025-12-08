import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Check, X, Eye } from 'lucide-react';
import { eventService, Event } from '../../services/eventService';
import { Button, Card, Loading, Modal } from '../common';
import toast from 'react-hot-toast';

interface EventApprovalProps {
  onEventStatusChanged?: () => void;
}

export default function EventApproval({ onEventStatusChanged }: EventApprovalProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents({ status: statusFilter, limit: 50 });
      setEvents(data.events);
    } catch (error) {
      toast.error('Không thể tải danh sách sự kiện');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    if (!confirm('Phê duyệt sự kiện này?')) return;

    try {
      await eventService.approveEvent(eventId);
      toast.success('Đã phê duyệt sự kiện');
      fetchEvents();
      if (onEventStatusChanged) onEventStatusChanged();
    } catch (error) {
      toast.error('Không thể phê duyệt sự kiện');
    }
  };

  const handleReject = async (eventId: string) => {
    if (!confirm('Từ chối sự kiện này?')) return;

    try {
      await eventService.rejectEvent(eventId);
      toast.success('Đã từ chối sự kiện');
      fetchEvents();
      if (onEventStatusChanged) onEventStatusChanged();
    } catch (error) {
      toast.error('Không thể từ chối sự kiện');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Xóa sự kiện này? Hành động này không thể hoàn tác!')) return;

    try {
      await eventService.deleteEvent(eventId);
      toast.success('Đã xóa sự kiện');
      fetchEvents();
      if (onEventStatusChanged) onEventStatusChanged();
    } catch (error) {
      toast.error('Không thể xóa sự kiện');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800' },
    };
    const c = config[status as keyof typeof config] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

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

  if (loading && events.length === 0) {
    return <Loading text="Đang tải sự kiện..." />;
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex gap-3">
        {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'primary' : 'outline'}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'PENDING' && 'Chờ duyệt'}
            {status === 'APPROVED' && 'Đã duyệt'}
            {status === 'REJECTED' && 'Từ chối'}
            {status === 'PENDING' && events.filter(e => e.status === 'PENDING').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                {events.filter(e => e.status === 'PENDING').length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không có sự kiện nào</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                    {getStatusBadge(event.status)}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {getCategoryLabel(event.category)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {event._count?.registrations || 0}
                        {event.maxParticipants && ` / ${event.maxParticipants}`}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">Quản lý:</span> {event.manager?.fullName}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDetailModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {event.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(event.id)}
                        className="flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(event.id)}
                        className="flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Từ chối
                      </Button>
                    </>
                  )}

                  {(event.status === 'REJECTED' || event.status === 'APPROVED') && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(event.id)}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết sự kiện"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện</label>
              <p className="text-gray-900 font-semibold">{selectedEvent.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <p className="text-gray-900">{getCategoryLabel(selectedEvent.category)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <div>{getStatusBadge(selectedEvent.status)}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
              <p className="text-gray-900">{selectedEvent.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu</label>
                <p className="text-gray-900">
                  {new Date(selectedEvent.startDate).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc</label>
                <p className="text-gray-900">
                  {new Date(selectedEvent.endDate).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Người quản lý</label>
              <p className="text-gray-900">{selectedEvent.manager?.fullName}</p>
              <p className="text-sm text-gray-500">{selectedEvent.manager?.email}</p>
            </div>

            {selectedEvent.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
