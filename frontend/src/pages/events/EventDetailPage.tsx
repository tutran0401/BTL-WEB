import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { eventService, Event } from '../../services/eventService';
import { registrationService, Registration } from '../../services/registrationService';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import { PostList } from '../../components/social';
import { useSocket } from '../../contexts/SocketContext';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { joinEvent, leaveEvent } = useSocket();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  // Get postId from URL query params for highlighting
  const highlightPostId = searchParams.get('postId');

  // Join socket room for this event to receive real-time updates
  useEffect(() => {
    if (id && isAuthenticated) {
      joinEvent(id);
      return () => {
        leaveEvent(id);
      };
    }
  }, [id, isAuthenticated, joinEvent, leaveEvent]);

  // Real-time updates for registrations
  useRealtimeUpdates({
    onRegistrationUpdated: (data) => {
      console.log('📨 Registration updated in EventDetail:', {
        data,
        myUserId: user?.id,
        currentEventId: id,
        registrationUserId: data?.registration?.userId,
        registrationEventId: data?.registration?.eventId,
      });

      const { registration, action } = data;

      // If this is MY registration, update my registration status
      if (registration.userId === user?.id && registration.eventId === id) {
        console.log('✅ This is MY registration! Updating...');
        setMyRegistration(registration);

        // Show toast notification based on action
        if (action === 'approved') {
          toast.success('🎉 Đăng ký của bạn đã được duyệt!', { duration: 5000 });
        } else if (action === 'rejected') {
          toast.error('❌ Đăng ký của bạn đã bị từ chối', { duration: 5000 });
        } else if (action === 'completed') {
          toast.success('🎊 Chúc mừng! Bạn đã hoàn thành sự kiện!', { duration: 5000 });
        }
      } else {
        console.log('ℹ️ Not my registration, but reloading event for count update');
      }

      // Reload event to update registration count
      if (registration.eventId === id) {
        loadEventDetail();
      }
    },

    onEventUpdated: (data) => {
      console.log('🔄 Event updated in EventDetail:', data);

      // If this is the current event, update it
      if (data.eventId === id || data.event?.id === id) {
        const updatedEvent = data.event;

        // Check if event was rejected or cancelled
        if (updatedEvent && (updatedEvent.status === 'REJECTED' || updatedEvent.status === 'CANCELLED')) {
          toast.error(
            updatedEvent.status === 'REJECTED'
              ? '⚠️ Sự kiện này đã bị từ chối bởi Admin'
              : '⚠️ Sự kiện này đã bị hủy',
            { duration: 5000 }
          );

          // Redirect after 2 seconds
          setTimeout(() => {
            navigate('/events');
          }, 2000);
        } else {
          // Regular update - reload event details
          loadEventDetail();
        }
      }
    },

    onEventDeleted: (data) => {
      console.log('🗑️ Event deleted in EventDetail:', data);

      // If this is the current event, redirect
      if (data.eventId === id) {
        toast.error('⚠️ Sự kiện này đã bị xóa', { duration: 5000 });

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/events');
        }, 2000);
      }
    },

    onEventRejected: (data) => {
      console.log('❌ Event rejected in EventDetail:', data);

      // If this is the current event, redirect
      if (data.eventId === id) {
        toast.error('⚠️ Sự kiện này đã bị từ chối bởi Admin', { duration: 5000 });

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/events');
        }, 2000);
      }
    },

    onNotification: (data) => {
      console.log('🔔 Notification in EventDetail:', data);
      // Handle notifications if needed
    }
  });

  // Load thông tin sự kiện
  useEffect(() => {
    if (id) {
      loadEventDetail();
      if (isAuthenticated) {
        checkMyRegistration();
      }
    }
  }, [id, isAuthenticated]);

  // Debug: Log URL params when component mounts
  useEffect(() => {
    if (id) {
      console.log('EventDetailPage mounted:', {
        eventId: id,
        highlightPostId,
        userId: user?.id,
        userRole: user?.role
      });
    }
  }, []); // Only on mount

  const loadEventDetail = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventById(id!);
      setEvent(data);
    } catch (error: any) {
      console.error('Load event detail error:', error);

      // Show specific error message
      const status = error?.response?.status;
      const message = error?.response?.data?.error;

      if (status === 404) {
        toast.error(message || 'Không tìm thấy sự kiện này. Sự kiện có thể đã bị xóa hoặc bạn không có quyền xem.');
      } else if (status === 403) {
        toast.error('Bạn không có quyền xem sự kiện này.');
      } else {
        toast.error(message || 'Không thể tải thông tin sự kiện');
      }

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
      TREE_PLANTING: { label: 'Trồng cây', class: 'bg-green-100 text-green-700' },
      CLEANING: { label: 'Dọn dẹp', class: 'bg-blue-100 text-blue-700' },
      CHARITY: { label: 'Từ thiện', class: 'bg-pink-100 text-pink-700' },
      EDUCATION: { label: 'Giáo dục', class: 'bg-purple-100 text-purple-700' },
      HEALTHCARE: { label: 'Y tế', class: 'bg-red-100 text-red-700' },
      DIGITAL_LITERACY: { label: 'Tin học', class: 'bg-indigo-100 text-indigo-700' },
      COMMUNITY: { label: 'Cộng đồng', class: 'bg-yellow-100 text-yellow-700' },
      OTHER: { label: 'Khác', class: 'bg-gray-100 text-gray-700' }
    };
    const config = categoryConfig[category] || { label: category, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const canCancelRegistration = () => {
    if (!myRegistration) return false;
    // Chỉ cho phép hủy đăng ký nếu đang PENDING hoặc APPROVED
    return myRegistration.status === 'PENDING' || myRegistration.status === 'APPROVED';
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
              src={getImageUrl(event.imageUrl)}
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
                {/* Ongoing Event Badge */}
                {event.status === 'APPROVED' && (() => {
                  const now = new Date();
                  const startDate = new Date(event.startDate);
                  const endDate = new Date(event.endDate);

                  if (startDate <= now && endDate >= now) {
                    return (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium rounded-full">
                        Sự kiện đang diễn ra
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Registration Status - Hiển thị nếu đã đăng ký */}
          {myRegistration && !checkingRegistration && (
            <div className={`mb-6 p-4 rounded-lg ${myRegistration.status === 'REJECTED'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
              }`}>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className={`font-semibold ${myRegistration.status === 'REJECTED' ? 'text-red-900' : 'text-blue-900'
                    }`}>
                    Trạng thái đăng ký của bạn:
                  </p>
                  <div className="mt-2">{getStatusBadge(myRegistration.status)}</div>
                  {myRegistration.status === 'REJECTED'}
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
            {(() => {
              // If user already registered, show cancel button in registration status section
              if (myRegistration) return null;

              const now = new Date();
              const eventStartDate = new Date(event.startDate);
              const eventEndDate = new Date(event.endDate);
              const isNotStarted = eventStartDate > now;
              const isOngoing = eventStartDate <= now && eventEndDate >= now;
              const isEnded = eventEndDate < now;

              // Only show actions for APPROVED events
              if (event.status !== 'APPROVED') return null;

              // Event has ended
              if (isEnded) {
                return (
                  <div className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg text-center font-semibold">
                    Sự kiện đã kết thúc
                  </div>
                );
              }

              // Event is ongoing - don't show anything
              if (isOngoing) return null;

              // Event hasn't started yet
              if (isNotStarted) {
                // Check if event is full
                if (event.maxParticipants && (event._count?.registrations ?? 0) >= event.maxParticipants) {
                  return (
                    <div className="flex-1 px-6 py-3 bg-red-100 text-red-600 rounded-lg text-center font-semibold">
                      Sự kiện đã đầy
                    </div>
                  );
                }

                // User not authenticated
                if (!isAuthenticated) {
                  return (
                    <button
                      onClick={() => navigate('/login', { state: { from: `/events/${id}` } })}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
                    >
                      Đăng nhập để đăng ký
                    </button>
                  );
                }

                // User is not a volunteer
                if (user?.role !== 'VOLUNTEER') return null;

                // Show register button
                return (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
                  >
                    {registering ? 'Đang đăng ký...' : '✓ Đăng ký tham gia'}
                  </button>
                );
              }

              return null;
            })()}
          </div>
        </div>
      </div>

      {/* Social Features - Bảng tin sự kiện */}
      {event.status === 'APPROVED' && (
        <div className="mt-8">
          <PostList eventId={event.id} highlightPostId={highlightPostId || undefined} />
        </div>
      )}
    </div>
  );
}

