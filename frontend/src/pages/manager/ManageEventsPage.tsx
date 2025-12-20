import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, Check, X, Eye, CheckCircle, Upload, Download } from 'lucide-react';
import { eventService, Event } from '../../services/eventService';
import { registrationService, Registration } from '../../services/registrationService';
import { Button, Card, Modal, Loading } from '../../components/common';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

  // Setup real-time updates for events and registrations
  useRealtimeUpdates({
    onEventUpdated: (data) => {
      console.log('✅ Event updated:', data);
      const { event, action } = data;

      // Update event in list
      setEvents((prevEvents) => {
        const index = prevEvents.findIndex(e => e.id === event.id);
        if (index !== -1) {
          const newEvents = [...prevEvents];
          newEvents[index] = event;
          return newEvents;
        }
        return prevEvents;
      });

      // Show toast notification
      if (action === 'approved') {
        toast.success(`Sự kiện "${event.title}" đã được duyệt!`, { duration: 5000 });
      } else if (action === 'rejected') {
        toast.error(`❌ Sự kiện "${event.title}" đã bị từ chối!`, { duration: 5000 });
      }
    },

    onRegistrationUpdated: (data) => {
      console.log('✅ Registration updated:', data);
      const { registration, action } = data;

      // Refresh events to update registration count
      fetchMyEvents();

      // Update pending count for affected event
      if (registration.eventId) {
        loadPendingCount(registration.eventId);
      }

      // If viewing registrations for this event, update them
      if (showRegistrationsModal && selectedEvent?.id === registration.eventId) {
        setRegistrations((prevRegs) => {
          const index = prevRegs.findIndex(r => r.id === registration.id);
          if (index !== -1) {
            const newRegs = [...prevRegs];
            newRegs[index] = registration;
            return newRegs;
          }
          return prevRegs;
        });
      }

      // Show toast notification
      const userName = registration.user?.fullName || 'Tình nguyện viên';
      if (action === 'approved') {
        toast.success(`Đã duyệt đăng ký của ${userName}`, { duration: 3000 });
      } else if (action === 'rejected') {
        toast(`❌ Đã từ chối đăng ký của ${userName}`, { duration: 3000 });
      } else if (action === 'completed') {
        toast.success(`🎉 ${userName} đã hoàn thành sự kiện!`, { duration: 3000 });
      }
    },

    onNotification: (data) => {
      console.log('🔔 Notification received:', data);
      // This is handled by useSocketNotifications hook in Navbar
    },
  });

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

      // Load pending counts for all events
      for (const event of myEvents) {
        loadPendingCount(event.id);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách sự kiện');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load pending registration count for an event
  const loadPendingCount = async (eventId: string) => {
    try {
      const data = await registrationService.getEventRegistrations(eventId);
      const pendingCount = data.registrations.filter((r: Registration) => r.status === 'PENDING').length;
      setPendingCounts(prev => ({ ...prev, [eventId]: pendingCount }));
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
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

  const exportToCSV = () => {
    if (registrations.length === 0) {
      toast.error('Không có dữ liệu để export');
      return;
    }

    // Tạo CSV header
    const headers = ['STT', 'Họ tên', 'Email', 'Số điện thoại', 'Trạng thái', 'Hoàn thành', 'Ngày đăng ký'];

    // Tạo CSV rows với format đúng cho số điện thoại
    const rows = registrations.map((reg, index) => [
      index + 1,
      reg.user?.fullName || '',
      reg.user?.email || '',
      // Thêm tab (\t) trước số điện thoại để Excel hiểu đúng định dạng văn bản
      reg.user?.phone ? `\t${reg.user.phone}` : '',
      getStatusText(reg.status),
      reg.isCompleted ? 'Có' : 'Không',
      new Date(reg.createdAt).toLocaleDateString('vi-VN')
    ]);

    // Kết hợp header và rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Thêm BOM để Excel hiển thị đúng tiếng Việt
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Tạo link download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `danh-sach-tinh-nguyen-vien-${selectedEvent?.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã export danh sách ra CSV');
  };

  const getStatusText = (status: string) => {
    const labels = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn thành',
    };
    return labels[status as keyof typeof labels] || status;
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
                    {pendingCounts[event.id] > 0 && (
                      <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse shadow-lg">
                        {pendingCounts[event.id]} chờ duyệt
                      </span>
                    )}
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
                    onClick={() => handleEdit(event)}
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

      {/* Edit Event Modal */}
      {selectedEvent && (
        <EditEventModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
            fetchMyEvents();
          }}
          event={selectedEvent}
        />
      )}

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
          <>
            {/* Export Button */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Tổng số: <span className="font-semibold">{registrations.length}</span> người đăng ký
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
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
          </>
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
  const { token } = useAuthStore(); // LẤY TOKEN TỪ ZUSTAND STORE

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
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      if (!token) {
        toast.error('Bạn cần đăng nhập để upload ảnh');
        setUploading(false);
        return;
      }

      console.log('🔑 Token from Zustand:', token?.substring(0, 20) + '...');
      console.log('📤 Uploading to:', `${import.meta.env.VITE_API_URL}/events/upload-image`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      toast.error('Không thể upload ảnh');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh sự kiện (tùy chọn)
          </label>

          {/* Image Preview */}
          {formData.imageUrl && (
            <div className="mb-3 relative">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  toast.error('Không thể tải ảnh. Vui lòng kiểm tra URL.');
                }}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, imageUrl: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                title="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload or URL input */}
          <div className="space-y-3">
            {/* File Upload Button */}
            <label className="block cursor-pointer">
              <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition text-center bg-gray-50 hover:bg-gray-100">
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span className="text-sm">Đang tải lên...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm font-medium">Chọn ảnh từ máy tính</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WebP - Tối đa 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">hoặc</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* URL Input */}
            <div>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập URL ảnh: https://..."
              />
            </div>
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

// Edit Event Modal Component
function EditEventModal({ isOpen, onClose, onSuccess, event }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: Event;
}) {
  const { token } = useAuthStore();

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    location: event.location,
    startDate: new Date(event.startDate).toISOString().slice(0, 16),
    endDate: new Date(event.endDate).toISOString().slice(0, 16),
    category: event.category,
    maxParticipants: event.maxParticipants?.toString() || '',
    imageUrl: event.imageUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Update formData when event changes
  useEffect(() => {
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      category: event.category,
      maxParticipants: event.maxParticipants?.toString() || '',
      imageUrl: event.imageUrl || '',
    });
  }, [event]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      if (!token) {
        toast.error('Bạn cần đăng nhập để upload ảnh');
        setUploading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      toast.error('Không thể upload ảnh');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        imageUrl: formData.imageUrl || undefined,
      };

      await eventService.updateEvent(event.id, data);
      toast.success('Cập nhật sự kiện thành công!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể cập nhật sự kiện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa sự kiện" size="lg">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh sự kiện (tùy chọn)
          </label>

          {formData.imageUrl && (
            <div className="mb-3 relative">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  toast.error('Không thể tải ảnh. Vui lòng kiểm tra URL.');
                }}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, imageUrl: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                title="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-3">
            <label className="block cursor-pointer">
              <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition text-center bg-gray-50 hover:bg-gray-100">
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span className="text-sm">Đang tải lên...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm font-medium">Chọn ảnh từ máy tính</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WebP - Tối đa 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">hoặc</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập URL ảnh: https://..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" loading={loading}>
            Cập nhật sự kiện
          </Button>
        </div>
      </form>
    </Modal>
  );
}