import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, Check, X, Eye, CheckCircle } from 'lucide-react';
import { eventService, Event } from '../../services/eventService';
import { registrationService, Registration } from '../../services/registrationService';
import { Button, Card, Modal, Loading } from '../../components/common';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const categories = [
  { value: 'TREE_PLANTING', label: 'Trồng cây' },
  { value: 'CLEANING', label: 'Dọn dẹp' },
  { value: 'CHARITY', label: 'Từ thiện' },
  { value: 'EDUCATION', label: 'Giáo dục' },
  { value: 'HEALTHCARE', label: 'Y tế' },
  { value: 'DIGITAL_LITERACY', label: 'Tin học' },
  { value: 'COMMUNITY', label: 'Cộng đồng' },
  { value: 'OTHER', label: 'Khác' },
];

export default function ManageEventsPage() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      // Backend sẽ tự filter events của manager hiện tại
      const data = await eventService.getAllEvents();
      // Filter events của mình (hoặc backend đã filter rồi)
      const myEvents = data.events.filter((e: Event) => e.manager?.id === user?.id);
      setEvents(myEvents);
    } catch (error) {
      toast.error('Không thể tải danh sách sự kiện');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;

    try {
      await eventService.deleteEvent(id);
      toast.success('Đã xóa sự kiện');
      fetchMyEvents();
    } catch (error) {
      toast.error('Không thể xóa sự kiện');
    }
  };

  const handleViewRegistrations = async (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationsModal(true);
    setLoadingRegistrations(true);

    try {
      const data = await registrationService.getEventRegistrations(event.id);
      setRegistrations(data.registrations);
    } catch (error) {
      toast.error('Không thể tải danh sách đăng ký');
      console.error(error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      await registrationService.approveRegistration(registrationId);
      toast.success('Đã duyệt đăng ký');
      // Reload registrations
      if (selectedEvent) {
        const data = await registrationService.getEventRegistrations(selectedEvent.id);
        setRegistrations(data.registrations);
      }
    } catch (error) {
      toast.error('Không thể duyệt đăng ký');
    }
  };

  const handleReject = async (registrationId: string) => {
    if (!confirm('Bạn có chắc muốn từ chối đăng ký này?')) return;

    try {
      await registrationService.rejectRegistration(registrationId);
      toast.success('Đã từ chối đăng ký');
      // Reload registrations
      if (selectedEvent) {
        const data = await registrationService.getEventRegistrations(selectedEvent.id);
        setRegistrations(data.registrations);
      }
    } catch (error) {
      toast.error('Không thể từ chối đăng ký');
    }
  };

  const handleMarkComplete = async (registrationId: string) => {
    if (!confirm('Đánh dấu hoàn thành cho đăng ký này?')) return;

    try {
      await registrationService.markAsCompleted(registrationId);
      toast.success('Đã đánh dấu hoàn thành');
      // Reload registrations
      if (selectedEvent) {
        const data = await registrationService.getEventRegistrations(selectedEvent.id);
        setRegistrations(data.registrations);
      }
    } catch (error) {
      toast.error('Không thể đánh dấu hoàn thành');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn thành',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getEventStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const labels = {
      PENDING: 'Chờ admin duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Bị từ chối',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải sự kiện..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sự kiện</h1>
          <p className="text-gray-600 mt-2">Quản lý các sự kiện bạn đã tạo</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tạo sự kiện mới
        </Button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có sự kiện nào
          </h3>
          <p className="text-gray-500 mb-4">Tạo sự kiện đầu tiên của bạn!</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Tạo sự kiện
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                    {getEventStatusBadge(event.status)}
                  </div>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString('vi-VN')} - {new Date(event.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {event._count?.registrations || 0}
                        {event.maxParticipants && ` / ${event.maxParticipants}`} người đăng ký
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewRegistrations(event)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Xem đăng ký
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {/* TODO: Edit */}}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchMyEvents();
        }}
      />

      {/* Registrations Modal */}
      <Modal
        isOpen={showRegistrationsModal}
        onClose={() => setShowRegistrationsModal(false)}
        title={`Danh sách đăng ký - ${selectedEvent?.title}`}
        size="lg"
      >
        {loadingRegistrations ? (
          <Loading text="Đang tải..." />
        ) : registrations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có người đăng ký</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{reg.user?.fullName}</h4>
                  <p className="text-sm text-gray-500">{reg.user?.email}</p>
                  {reg.user?.phone && (
                    <p className="text-sm text-gray-500">{reg.user.phone}</p>
                  )}
                  <div className="mt-2">{getStatusBadge(reg.status)}</div>
                </div>

                <div className="flex gap-2">
                  {reg.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(reg.id)}
                        className="flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(reg.id)}
                        className="flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Từ chối
                      </Button>
                    </>
                  )}
                  
                  {reg.status === 'APPROVED' && !reg.isCompleted && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleMarkComplete(reg.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Hoàn thành
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

// Create Event Modal Component
function CreateEventModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    category: 'TREE_PLANTING',
    maxParticipants: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        imageUrl: formData.imageUrl || undefined,
      };

      await eventService.createEvent(data);
      toast.success('Tạo sự kiện thành công! Chờ admin duyệt.');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể tạo sự kiện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo sự kiện mới" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sự kiện *
          </label>
          <input
            type="text"
            required
            minLength={5}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="VD: Trồng cây xanh tại công viên..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả *
          </label>
          <textarea
            required
            minLength={20}
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Mô tả chi tiết về sự kiện..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa điểm *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Công viên Thống Nhất, Hà Nội"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày bắt đầu *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày kết thúc *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số người tối đa (tùy chọn)
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh URL (tùy chọn)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" loading={loading}>
            Tạo sự kiện
          </Button>
        </div>
      </form>
    </Modal>
  );
}