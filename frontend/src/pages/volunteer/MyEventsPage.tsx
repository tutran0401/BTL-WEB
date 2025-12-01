import { useState, useEffect } from 'react';
import { registrationService, Registration } from '../../services/registrationService';
import { useNavigate } from 'react-router-dom';

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRegistrations();
  }, [filter]);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationService.getMyRegistrations(filter || undefined);
      setRegistrations(response.registrations);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải danh sách sự kiện');
      console.error('Fetch registrations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký sự kiện này?')) {
      return;
    }

    try {
      await registrationService.cancelRegistration(eventId);
      alert('Đã hủy đăng ký thành công');
      fetchMyRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể hủy đăng ký');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ duyệt' },
      APPROVED: { color: 'bg-green-100 text-green-800', text: 'Đã duyệt' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: 'Từ chối' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', text: 'Đã hủy' },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', text: 'Hoàn thành' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sự kiện của tôi</h1>
        <p className="text-gray-600">Xem lịch sử tham gia và quản lý đăng ký sự kiện</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === '' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'PENDING' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Chờ duyệt
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'APPROVED' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Đã duyệt
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'COMPLETED' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Hoàn thành
        </button>
        <button
          onClick={() => setFilter('CANCELLED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'CANCELLED' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Đã hủy
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có sự kiện nào</h3>
          <p className="mt-2 text-gray-600">
            {filter ? 'Không tìm thấy sự kiện với trạng thái này' : 'Bạn chưa đăng ký tham gia sự kiện nào'}
          </p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Khám phá sự kiện
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="md:flex">
                {/* Event Image */}
                <div className="md:w-1/3">
                  <img
                    src={registration.event?.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={registration.event?.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => navigate(`/events/${registration.eventId}`)}
                  />
                </div>

                {/* Event Info */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2
                      className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/events/${registration.eventId}`)}
                    >
                      {registration.event?.title}
                    </h2>
                    {getStatusBadge(registration.status)}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {registration.event?.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {formatDate(registration.event?.startDate || '')} - {formatDate(registration.event?.endDate || '')}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{registration.event?.location}</span>
                    </div>

                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="capitalize">{registration.event?.category}</span>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 mt-3">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Đăng ký lúc: {formatDate(registration.createdAt)}</span>
                    </div>

                    {registration.completedAt && (
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Hoàn thành lúc: {formatDate(registration.completedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/events/${registration.eventId}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>

                    {(registration.status === 'PENDING' || registration.status === 'APPROVED') && (
                      <button
                        onClick={() => handleCancelRegistration(registration.eventId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Hủy đăng ký
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && registrations.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Thống kê</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{registrations.length}</div>
              <div className="text-sm text-gray-600">Tổng số</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {registrations.filter(r => r.status === 'PENDING').length}
              </div>
              <div className="text-sm text-gray-600">Chờ duyệt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {registrations.filter(r => r.status === 'APPROVED').length}
              </div>
              <div className="text-sm text-gray-600">Đã duyệt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {registrations.filter(r => r.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {registrations.filter(r => r.status === 'CANCELLED' || r.status === 'REJECTED').length}
              </div>
              <div className="text-sm text-gray-600">Đã hủy/Từ chối</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

