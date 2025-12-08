import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Edit2, Save, X } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { Card, Button, Loading } from '../../components/common';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setUser(data);
      setFormData({
        fullName: data.fullName,
        phone: data.phone || '',
      });
    } catch (error) {
      toast.error('Không thể tải thông tin profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const updatedUser = await userService.updateProfile(formData);
      setUser(updatedUser);
      updateUser(updatedUser);
      toast.success('Cập nhật profile thành công');
      setEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName,
      phone: user.phone || '',
    });
    setEditing(false);
  };

  const getRoleBadge = (role: string) => {
    const config = {
      ADMIN: { label: 'Admin', color: 'bg-red-100 text-red-800' },
      EVENT_MANAGER: { label: 'Quản lý sự kiện', color: 'bg-blue-100 text-blue-800' },
      VOLUNTEER: { label: 'Tình nguyện viên', color: 'bg-green-100 text-green-800' },
    };
    const c = config[role as keyof typeof config] || { label: role, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.color}`}>{c.label}</span>;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
      LOCKED: { label: 'Đã khóa', color: 'bg-red-100 text-red-800' },
      PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
    };
    const c = config[status as keyof typeof config] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.color}`}>{c.label}</span>;
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải hồ sơ..." />;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-600 mt-2">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
              <div className="flex gap-2 mt-2">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.accountStatus)}
              </div>
            </div>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>

        {editing ? (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={submitting}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button type="submit" loading={submitting}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
          </form>
        ) : (
          /* View Profile */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </label>
                <p className="text-gray-900 font-medium">{user.phone || 'Chưa cập nhật'}</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <Shield className="w-4 h-4" />
                  Vai trò
                </label>
                <div>{getRoleBadge(user.role)}</div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <User className="w-4 h-4" />
                  Trạng thái
                </label>
                <div>{getStatusBadge(user.accountStatus)}</div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Ngày tạo tài khoản:</span>{' '}
                {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {user.updatedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Cập nhật lần cuối:</span>{' '}
                  {new Date(user.updatedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Additional Info */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Email không thể thay đổi</p>
          <p>• Vai trò được gán bởi admin</p>
          <p>• Nếu cần thay đổi vai trò, vui lòng liên hệ admin</p>
        </div>
      </Card>
    </div>
  );
}

