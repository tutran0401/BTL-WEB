import { useState, useEffect } from 'react';
import { eventService, Event } from '../../services/eventService';
import { useAuthStore } from '../../store/authStore';

const EVENT_CATEGORIES = [
  { value: 'TREE_PLANTING', label: 'Trồng cây' },
  { value: 'CLEANING', label: 'Vệ sinh môi trường' },
  { value: 'CHARITY', label: 'Từ thiện' },
  { value: 'EDUCATION', label: 'Giáo dục' },
  { value: 'HEALTHCARE', label: 'Y tế' },
  { value: 'DIGITAL_LITERACY', label: 'Công nghệ' },
];

const EVENT_STATUS = [
  { value: 'PENDING', label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'APPROVED', label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Bị từ chối', color: 'bg-red-100 text-red-800' },
];

export default function ManageEventsPage() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    category: 'TREE_PLANTING',
    maxParticipants: 50,
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMyEvents();
  }, [filterStatus]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents({ 
        status: filterStatus || undefined 
      });
      
      // Filter events created by current manager
      const myEvents = response.events.filter(
        (event: Event) => event.manager?.id === user?.userId
      );
      
      setEvents(myEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Địa điểm không được để trống';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu không được để trống';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc không được để trống';
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
      if (start < new Date()) {
        newErrors.startDate = 'Ngày bắt đầu phải trong tương lai';
      }
    }
    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Số lượng tối thiểu là 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, formData);
        alert('Cập nhật sự kiện thành công!');
      } else {
        await eventService.createEvent(formData);
        alert('Tạo sự kiện thành công! Vui lòng chờ admin phê duyệt.');
      }
      
      setShowModal(false);
      resetForm();
      fetchMyEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      category: event.category,
      maxParticipants: event.maxParticipants || 50,
      imageUrl: event.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      return;
    }

    try {
      await eventService.deleteEvent(id);
      alert('Xóa sự kiện thành công!');
      fetchMyEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      category: 'TREE_PLANTING',
      maxParticipants: 50,
      imageUrl: '',
    });
    setEditingEvent(null);
    setErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    return EVENT_STATUS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return EVENT_STATUS.find(s => s.value === status)?.label || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý sự kiện của tôi</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          ➕ Tạo sự kiện mới
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lọc theo trạng thái:
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="">Tất cả</option>
          {EVENT_STATUS.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Chưa có sự kiện nào</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Tạo sự kiện đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="md:flex">
                {/* Image */}
                {event.imageUrl && (
                  <div className="md:w-1/3">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className={`p-6 ${event.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">📍 Địa điểm:</span>
                      <p className="font-medium">{event.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">🏷️ Danh mục:</span>
                      <p className="font-medium">
                        {EVENT_CATEGORIES.find(c => c.value === event.category)?.label}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">🕐 Bắt đầu:</span>
                      <p className="font-medium">{formatDate(event.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">🕐 Kết thúc:</span>
                      <p className="font-medium">{formatDate(event.endDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">👥 Đã đăng ký:</span>
                      <p className="font-medium">
                        {event._count?.registrations || 0} / {event.maxParticipants || 'Không giới hạn'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">💬 Bài viết:</span>
                      <p className="font-medium">{event._count?.posts || 0}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                    placeholder="Nhập tiêu đề sự kiện"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                    placeholder="Mô tả chi tiết về sự kiện"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa điểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                    placeholder="Nhập địa điểm tổ chức"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    {EVENT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng tối đa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className={`w-full border ${errors.maxParticipants ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                  />
                  {errors.maxParticipants && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL hình ảnh
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    {editingEvent ? 'Cập nhật' : 'Tạo sự kiện'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

