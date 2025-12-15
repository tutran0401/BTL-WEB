# 📝 EventDetailPage - Hướng dẫn đầy đủ

## 🎯 Tổng quan

EventDetailPage là trang hiển thị chi tiết sự kiện và cho phép tình nguyện viên đăng ký tham gia.

---

## 📁 Files liên quan

### Backend (Đã có sẵn)
- `backend/src/controllers/event.controller.ts` - Event CRUD
- `backend/src/controllers/registration.controller.ts` - Registration logic
- `backend/src/routes/event.routes.ts` - Event routes
- `backend/src/routes/registration.routes.ts` - Registration routes

### Frontend (Đã triển khai)
- `frontend/src/services/registrationService.ts` ✅ NEW
- `frontend/src/pages/events/EventDetailPage.tsx` ✅ UPDATED

---

## 🔄 Luồng hoạt động

### Flow Chart

```
User vào /events/{id}
    ↓
Load event info (getEventById)
    ↓
Đã login? 
    YES → Kiểm tra đã đăng ký chưa (getMyRegistrations)
    NO  → Hiển thị "Đăng nhập để đăng ký"
    ↓
Đã đăng ký?
    YES → Hiển thị trạng thái + nút "Hủy đăng ký"
    NO  → Tiếp tục check
    ↓
Role = VOLUNTEER?
    NO  → Ẩn nút đăng ký
    YES → Tiếp tục check
    ↓
Event = APPROVED?
    NO  → "Sự kiện chưa được phê duyệt"
    YES → Tiếp tục check
    ↓
Còn chỗ?
    NO  → "Sự kiện đã đầy"
    YES → Hiển thị "✓ Đăng ký tham gia"
```

### Điều kiện để đăng ký

```typescript
canRegister() {
  ✓ Đã đăng nhập
  ✓ Role = VOLUNTEER (không phải ADMIN/EVENT_MANAGER)
  ✓ Chưa đăng ký sự kiện này
  ✓ Sự kiện status = APPROVED
  ✓ Còn chỗ (nếu có maxParticipants)
}
```

---

## 🎨 UI Components

### Hiển thị thông tin

**1. Header**
- Ảnh sự kiện (h-96, object-cover)
- Tiêu đề
- Category badge
- Status badge

**2. Grid Layout (2 cột trên desktop, 1 cột mobile)**

```
┌─────────────────────────────────────────┐
│  ← Quay lại danh sách                   │
├─────────────────────────────────────────┤
│  [========== Ảnh sự kiện ==========]   │
├─────────────────────────────────────────┤
│  Tên sự kiện                            │
│  [Category] [Status]                    │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Trạng thái: [PENDING] [Hủy]     │  │
│  └──────────────────────────────────┘  │
│                                         │
│  📅 Thời gian          📍 Địa điểm      │
│  👤 Người quản lý      👥 Số lượng      │
│                                         │
│  Mô tả chi tiết                         │
│  ──────────────────────────────────    │
│  [    ✓ Đăng ký tham gia    ]          │
└─────────────────────────────────────────┘
```

### Status Badges

```typescript
PENDING   → 🟡 Yellow "Chờ duyệt"
APPROVED  → 🟢 Green "Đã duyệt"
REJECTED  → 🔴 Red "Từ chối"
CANCELLED → ⚫ Gray "Đã hủy"
COMPLETED → 🔵 Blue "Hoàn thành"
```

### Category Badges

```typescript
EDUCATION   → 🔵 Blue "Giáo dục"
ENVIRONMENT → 🟢 Green "Môi trường"
HEALTH      → 🔴 Red "Sức khỏe"
COMMUNITY   → 🟣 Purple "Cộng đồng"
OTHER       → ⚫ Gray "Khác"
```

---

## 🔗 API Endpoints

### Event
```typescript
GET /api/events/:id
// Response: { id, title, description, ... }
```

### Registration
```typescript
// Đăng ký
POST /api/registrations/events/:eventId/register
// Response: { message, registration }

// Hủy đăng ký
DELETE /api/registrations/events/:eventId/cancel
// Response: { message }

// Lấy đăng ký của tôi
GET /api/registrations/my-registrations
// Response: { registrations: [] }
```

---

## 🧪 Test Cases

### Test Case 1: User chưa đăng nhập
**Steps:**
1. Mở http://localhost:5173/events
2. Click vào một sự kiện
3. Xem trang chi tiết

**Expected:**
- ✅ Hiển thị đầy đủ thông tin sự kiện
- ✅ Có nút "Đăng nhập để đăng ký"
- ✅ Click nút → chuyển đến /login

---

### Test Case 2: Volunteer đăng ký thành công
**Steps:**
1. Login với volunteer
2. Vào /events/{id} (sự kiện APPROVED)
3. Click "✓ Đăng ký tham gia"

**Expected:**
- ✅ Toast: "Đăng ký thành công! Đang chờ phê duyệt."
- ✅ Nút đăng ký biến mất
- ✅ Hiển thị box: "Trạng thái đăng ký: [PENDING]"
- ✅ Có nút "Hủy đăng ký"

---

### Test Case 3: Hủy đăng ký
**Steps:**
1. Đã đăng ký sự kiện (status box hiển thị)
2. Click "Hủy đăng ký"
3. Confirm trong dialog

**Expected:**
- ✅ Toast: "Đã hủy đăng ký thành công"
- ✅ Status box biến mất
- ✅ Nút "Đăng ký tham gia" hiển thị lại

---

### Test Case 4: Admin/Manager không thể đăng ký
**Steps:**
1. Logout
2. Login với admin hoặc manager
3. Vào trang chi tiết sự kiện

**Expected:**
- ✅ Hiển thị thông tin sự kiện
- ✅ KHÔNG hiển thị nút đăng ký

---

### Test Case 5: Sự kiện đã đầy
**Setup:**
- Event với maxParticipants = 1
- Đã có 1 registration APPROVED

**Steps:**
1. Login volunteer khác
2. Vào sự kiện đã đầy

**Expected:**
- ✅ Hiển thị: "Sự kiện đã đầy"
- ✅ Không có nút đăng ký
- ✅ Hiển thị "1/1 người"

---

### Test Case 6: Sự kiện chưa approve
**Steps:**
1. Login volunteer
2. Vào sự kiện có status PENDING hoặc REJECTED

**Expected:**
- ✅ Hiển thị: "Sự kiện chưa được phê duyệt"
- ✅ Không có nút đăng ký active

---

### Test Case 7: Responsive Design
**Test Mobile (375px):**
- ✅ Ảnh full width
- ✅ Grid → 1 cột
- ✅ Buttons full width
- ✅ Text dễ đọc
- ✅ Không bị horizontal scroll

**Test Tablet (768px):**
- ✅ Grid → 2 cột
- ✅ Layout hợp lý

**Test Desktop (1920px):**
- ✅ Grid → 2 cột
- ✅ Content centered (container)

---

## 🚀 Cách sử dụng

### 1. Start servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Truy cập
```
http://localhost:5173/events/{event-id}
```

### 3. Test flow
1. Login với volunteer
2. Click vào một sự kiện
3. Click "Đăng ký tham gia"
4. Xem trạng thái đăng ký
5. Click "Hủy đăng ký" (nếu muốn)

---

## 🐛 Troubleshooting

### Issue: Nút đăng ký không hiển thị

**Debug:**
```javascript
// Trong browser console (F12)
console.log('User:', user);
console.log('Event:', event);
console.log('My Registration:', myRegistration);
console.log('Can Register:', canRegister());
```

**Check:**
- [ ] User đã login?
- [ ] Role = VOLUNTEER?
- [ ] Event = APPROVED?
- [ ] Chưa đăng ký?
- [ ] Còn chỗ?

---

### Issue: API 401 Unauthorized

**Check token:**
```javascript
console.log('Token:', useAuthStore.getState().token);
// → Nếu null → Login lại
```

---

### Issue: Đăng ký không thành công

**Debug:**
1. Check network tab (F12 → Network)
2. Xem response error
3. Check backend logs
4. Verify event status
5. Check số lượng participants

---

### Issue: UI không cập nhật

**Check:**
1. `checkMyRegistration()` có được gọi sau khi đăng ký không?
2. State `myRegistration` có được set không?

**Debug:**
```javascript
// Thêm log trong handleRegister:
console.log('Before:', myRegistration);
await registrationService.registerForEvent(id!);
await checkMyRegistration();
console.log('After:', myRegistration);
```

---

## 📝 Code Examples

### Registration Service

```typescript
// frontend/src/services/registrationService.ts

export const registrationService = {
  // Đăng ký sự kiện
  registerForEvent: async (eventId: string) => {
    const response = await api.post(`/registrations/events/${eventId}/register`);
    return response.data;
  },

  // Hủy đăng ký
  cancelRegistration: async (eventId: string) => {
    const response = await api.delete(`/registrations/events/${eventId}/cancel`);
    return response.data;
  },

  // Lấy danh sách đăng ký của tôi
  getMyRegistrations: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get('/registrations/my-registrations', { params });
    return response.data;
  }
};
```

### EventDetailPage Component

```typescript
// frontend/src/pages/events/EventDetailPage.tsx

const EventDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [myRegistration, setMyRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load event info
  const loadEventDetail = async () => {
    try {
      const data = await eventService.getEventById(id!);
      setEvent(data);
    } catch (error) {
      toast.error('Không thể tải thông tin sự kiện');
    } finally {
      setLoading(false);
    }
  };

  // Check đã đăng ký chưa
  const checkMyRegistration = async () => {
    try {
      const data = await registrationService.getMyRegistrations();
      const registration = data.registrations.find(
        (r: any) => r.eventId === id
      );
      setMyRegistration(registration || null);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  // Đăng ký sự kiện
  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setRegistering(true);
      await registrationService.registerForEvent(id!);
      toast.success('Đăng ký thành công! Đang chờ phê duyệt.');
      await checkMyRegistration();
    } catch (error) {
      toast.error('Đăng ký thất bại');
    } finally {
      setRegistering(false);
    }
  };

  // Hủy đăng ký
  const handleCancelRegistration = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đăng ký?')) return;
    
    try {
      setCancelling(true);
      await registrationService.cancelRegistration(id!);
      toast.success('Đã hủy đăng ký thành công');
      setMyRegistration(null);
    } catch (error) {
      toast.error('Không thể hủy đăng ký');
    } finally {
      setCancelling(false);
    }
  };

  // Check có thể đăng ký không
  const canRegister = () => {
    if (!isAuthenticated || !event) return false;
    if (user?.role !== 'VOLUNTEER') return false;
    if (myRegistration) return false;
    if (event.status !== 'APPROVED') return false;
    
    if (event.maxParticipants) {
      const approved = event._count?.registrations || 0;
      if (approved >= event.maxParticipants) return false;
    }
    
    return true;
  };

  useEffect(() => {
    if (id) {
      loadEventDetail();
      if (isAuthenticated) {
        checkMyRegistration();
      }
    }
  }, [id, isAuthenticated]);

  // ... render JSX
};
```

---

## ✅ Checklist hoàn thành

- [x] Registration Service
- [x] EventDetailPage component
- [x] Hiển thị thông tin đầy đủ
- [x] Logic đăng ký
- [x] Logic hủy đăng ký
- [x] Kiểm tra điều kiện đăng ký
- [x] Hiển thị trạng thái đăng ký
- [x] Responsive design
- [x] Error handling
- [x] Loading states
- [x] Toast notifications
- [x] TypeScript types

---

## 🎯 Success Criteria

EventDetailPage được coi là hoàn thành khi:

1. ✅ Volunteer có thể xem chi tiết sự kiện
2. ✅ Volunteer có thể đăng ký sự kiện
3. ✅ Volunteer có thể hủy đăng ký
4. ✅ Hiển thị đúng trạng thái đăng ký
5. ✅ UI đẹp, responsive
6. ✅ Error handling đầy đủ
7. ✅ Loading states
8. ✅ Toast notifications
9. ✅ TypeScript types đầy đủ
10. ✅ Code clean, dễ maintain

---

## 💡 Tips

1. **Luôn kiểm tra authentication trước khi gọi API**
2. **Hiển thị loading state khi đang xử lý**
3. **Validate điều kiện đăng ký trước khi gọi API**
4. **Hiển thị thông báo rõ ràng cho user**
5. **Xử lý tất cả các edge cases**
6. **Sử dụng toast để thông báo kết quả**
7. **Redirect về trang login nếu chưa đăng nhập**
8. **Cache trạng thái đăng ký để tránh gọi API nhiều lần**

---

**Chúc bạn thành công! 🚀**

