import { useState, useEffect } from 'react';
import { Search, Lock, Unlock, Shield, User } from 'lucide-react';
import { userService, User as UserType } from '../../services/userService';
import { Button, Card, Loading } from '../common';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.accountStatus = statusFilter;
      if (search) params.search = search;

      const data = await userService.getAllUsers(params);
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleUpdateStatus = async (userId: string, newStatus: 'ACTIVE' | 'LOCKED') => {
    const action = newStatus === 'LOCKED' ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

    try {
      await userService.updateUserStatus(userId, newStatus);
      toast.success(`Đã ${action} tài khoản thành công`);
      fetchUsers();
    } catch (error) {
      toast.error(`Không thể ${action} tài khoản`);
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      ADMIN: { label: 'Admin', color: 'bg-red-100 text-red-800' },
      EVENT_MANAGER: { label: 'Quản lý', color: 'bg-blue-100 text-blue-800' },
      VOLUNTEER: { label: 'Tình nguyện viên', color: 'bg-green-100 text-green-800' },
    };
    const c = config[role as keyof typeof config] || { label: role, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
      LOCKED: { label: 'Đã khóa', color: 'bg-red-100 text-red-800' },
      PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
    };
    const c = config[status as keyof typeof config] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

  if (loading && users.length === 0) {
    return <Loading text="Đang tải danh sách người dùng..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả vai trò</option>
              <option value="VOLUNTEER">Tình nguyện viên</option>
              <option value="EVENT_MANAGER">Quản lý sự kiện</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
              <option value="PENDING">Chờ duyệt</option>
            </select>

            <Button type="submit">Tìm kiếm</Button>
          </div>
        </form>
      </Card>

      {/* Users Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.accountStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== 'ADMIN' && (
                      <div className="flex justify-end gap-2">
                        {user.accountStatus === 'ACTIVE' ? (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleUpdateStatus(user.id, 'LOCKED')}
                            className="flex items-center gap-1"
                          >
                            <Lock className="w-4 h-4" />
                            Khóa
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleUpdateStatus(user.id, 'ACTIVE')}
                            className="flex items-center gap-1"
                          >
                            <Unlock className="w-4 h-4" />
                            Mở
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trước
          </Button>
          <div className="flex gap-2">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? 'primary' : 'outline'}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
