import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, Event } from '../../services/eventService';
import { registrationService, Registration } from '../../services/registrationService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { PostList } from '../../components/social';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  // Load thông tin sự kiện
  useEffect(() => {
    if (id) {
      loadEventDetail();
      if (isAuthenticated) {
        checkMyRegistration();
      }
    }
  }, [id, isAuthenticated]);

  const loadEventDetail = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventById(id!);
      setEvent(data);
    } catch (error) {
      toast.error('Không thể tải thông tin sự kiện');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const checkMyRegistration = async () => {
    try {
      setCheckingRegistration(true);
      const { registrations } = await registrationService.getMyRegistrations();
      const registration = registrations.find((r: Registration) => r.eventId === id);
      setMyRegistration(registration || null);
    } catch (error) {
      console.error('Error checking registration:', error);
    } finally {
      setCheckingRegistration(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đăng ký sự kiện');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (user?.role === 'ADMIN' || user?.role === 'EVENT_MANAGER') {
      toast.error('Admin và Manager không thể đăng ký tham gia sự kiện');
      return;
    }

    try {
      setRegistering(true);
      await registrationService.registerForEvent(id!);
      toast.success('Đăng ký thành công! Đang chờ phê duyệt.');
      checkMyRegistration();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || 'Đăng ký thất bại';
      toast.error(errorMsg);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm('Bạn có chắc muốn hủy đăng ký?')) return;

    try {
      setRegistering(true);
      await registrationService.cancelRegistration(id!);
      toast.success('Đã hủy đăng ký thành công');
      setMyRegistration(null);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || 'Hủy đăng ký thất bại';
      toast.error(errorMsg);
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      PENDING: { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Từ chối', class: 'bg-red-100 text-red-800' },
      CANCELLED: { label: 'Đã hủy', class: 'bg-gray-100 text-gray-800' },
      COMPLETED: { label: 'Hoàn thành', class: 'bg-blue-100 text-blue-800' }
    };
    const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig: any = {
      EDUCATION: { label: 'Giáo dục', class: 'bg-blue-100 text-blue-800' },
      ENVIRONMENT: { label: 'Môi trường', class: 'bg-green-100 text-green-800' },
      HEALTH: { label: 'Sức khỏe', class: 'bg-red-100 text-red-800' },
      COMMUNITY: { label: 'Cộng đồng', class: 'bg-purple-100 text-purple-800' },
      OTHER: { label: 'Khác', class: 'bg-gray-100 text-gray-800' }
    };
    const config = categoryConfig[category] || { label: category, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const canRegister = () => {
    if (!isAuthenticated || !event) return false;
    if (user?.role !== 'VOLUNTEER') return false;
    if (myRegistration) return false;
    if (event.status !== 'APPROVED') return false;
    if (event.maxParticipants && (event._count?.registrations ?? 0) >= event.maxParticipants) return false;
    return true;
  };

  const canCancelRegistration = () => {
    if (!myRegistration) return false;
    return myRegistration.status !== 'COMPLETED' && myRegistration.status !== 'CANCELLED';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sự kiện</h2>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách sự kiện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/events')}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        ← Quay lại danh sách
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Event Image */}
        {event.imageUrl && (
          <div className="w-full h-96 overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {/* Title and Status */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{event.title}</h1>
              <div className="flex gap-3">
                {getCategoryBadge(event.category)}
                {getStatusBadge(event.status)}
              </div>
            </div>
          </div>

          {/* Registration Status - Hiển thị nếu đã đăng ký */}
          {myRegistration && !checkingRegistration && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-900">Trạng thái đăng ký của bạn:</p>
                  <div className="mt-2">{getStatusBadge(myRegistration.status)}</div>
                </div>
                {canCancelRegistration() && (
                  <button
                    onClick={handleCancelRegistration}
                    disabled={registering}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {registering ? 'Đang xử lý...' : 'Hủy đăng ký'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">📅 Thời gian</h3>
              <p className="text-gray-600">
                <strong>Bắt đầu:</strong> {formatDate(event.startDate)}
              </p>
              <p className="text-gray-600">
                <strong>Kết thúc:</strong> {formatDate(event.endDate)}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">📍 Địa điểm</h3>
              <p className="text-gray-600">{event.location}</p>
            </div>

            {event.manager && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">👤 Người quản lý</h3>
                <p className="text-gray-600">{event.manager.fullName}</p>
                <p className="text-gray-500 text-sm">{event.manager.email}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">👥 Số lượng tham gia</h3>
              <p className="text-gray-600">
                {event._count?.registrations || 0}
                {event.maxParticipants && ` / ${event.maxParticipants}`} người
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Mô tả chi tiết</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            {canRegister() && (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
              >
                {registering ? 'Đang đăng ký...' : '✓ Đăng ký tham gia'}
              </button>
            )}

            {!isAuthenticated && event.status === 'APPROVED' && (
              <button
                onClick={() => navigate('/login', { state: { from: `/events/${id}` } })}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
              >
                Đăng nhập để đăng ký
              </button>
            )}

            {event.status !== 'APPROVED' && (
              <div className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg text-center font-semibold">
                Sự kiện chưa được phê duyệt
              </div>
            )}

            {event.maxParticipants && (event._count?.registrations ?? 0) >= event.maxParticipants && !myRegistration && (
              <div className="flex-1 px-6 py-3 bg-red-100 text-red-600 rounded-lg text-center font-semibold">
                Sự kiện đã đầy
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Features - Bảng tin sự kiện */}
      {event.status === 'APPROVED' && (
        <div className="mt-8">
          <PostList eventId={event.id} />
        </div>
      )}
    </div>
  );
}

