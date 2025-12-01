# 🎯 Demo & Test EventDetailPage

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Truy cập
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 📝 Test Scenarios

### Scenario 1: User chưa đăng nhập xem sự kiện

**Steps:**
1. Truy cập: http://localhost:5173/events
2. Click vào một sự kiện bất kỳ
3. Xem thông tin chi tiết

**Expected:**
- ✅ Hiển thị đầy đủ thông tin sự kiện
- ✅ Hiển thị nút "Đăng nhập để đăng ký"
- ✅ Click nút → chuyển đến trang login

---

### Scenario 2: Volunteer đăng ký sự kiện thành công

**Prerequisites:**
- Có tài khoản VOLUNTEER
- Có sự kiện APPROVED

**Steps:**
1. Login với tài khoản volunteer:
   ```
   Email: volunteer@example.com
   Password: password123
   ```

2. Truy cập: http://localhost:5173/events

3. Click vào sự kiện có status "Đã duyệt"

4. Click nút "✓ Đăng ký tham gia"

**Expected:**
- ✅ Hiển thị toast: "Đăng ký thành công! Đang chờ phê duyệt."
- ✅ Nút đăng ký biến mất
- ✅ Hiển thị box trạng thái: "Trạng thái đăng ký của bạn: PENDING"
- ✅ Có nút "Hủy đăng ký"

---

### Scenario 3: Hủy đăng ký

**Prerequisites:**
- Đã đăng ký sự kiện
- Status đăng ký != COMPLETED

**Steps:**
1. Vào trang chi tiết sự kiện đã đăng ký
2. Click nút "Hủy đăng ký"
3. Confirm trong dialog

**Expected:**
- ✅ Hiển thị toast: "Đã hủy đăng ký thành công"
- ✅ Box trạng thái biến mất
- ✅ Nút "Đăng ký tham gia" hiển thị lại

---

### Scenario 4: Admin/Manager không thể đăng ký

**Prerequisites:**
- Login với tài khoản ADMIN hoặc EVENT_MANAGER

**Steps:**
1. Login với admin:
   ```
   Email: admin@example.com
   Password: password123
   ```

2. Vào trang chi tiết sự kiện

**Expected:**
- ✅ Không hiển thị nút đăng ký
- ✅ Không hiển thị thông báo lỗi (chỉ ẩn nút)

---

### Scenario 5: Sự kiện đã đầy

**Prerequisites:**
- Sự kiện có maxParticipants = 10
- Đã có 10 người đăng ký APPROVED
- User chưa đăng ký

**Steps:**
1. Login với volunteer
2. Vào sự kiện đã đầy

**Expected:**
- ✅ Hiển thị thông báo: "Sự kiện đã đầy"
- ✅ Không có nút đăng ký
- ✅ Hiển thị "10/10 người"

---

### Scenario 6: Sự kiện chưa được duyệt

**Prerequisites:**
- Sự kiện có status = PENDING hoặc REJECTED

**Steps:**
1. Login với volunteer
2. Vào sự kiện chưa duyệt

**Expected:**
- ✅ Hiển thị: "Sự kiện chưa được phê duyệt"
- ✅ Không có nút đăng ký active

---

### Scenario 7: Đăng ký duplicate

**Prerequisites:**
- User đã đăng ký sự kiện này rồi

**Steps:**
1. Try đăng ký lại (có thể test qua API trực tiếp)

**Expected:**
- ❌ API trả về lỗi: "Already registered for this event"
- ✅ Frontend không cho phép (nút đã ẩn)

---

## 🧪 Test với curl/Postman

### 1. Đăng ký sự kiện
```bash
curl -X POST http://localhost:3000/api/registrations/events/{eventId}/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Hủy đăng ký
```bash
curl -X DELETE http://localhost:3000/api/registrations/events/{eventId}/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Lấy danh sách đăng ký
```bash
curl -X GET http://localhost:3000/api/registrations/my-registrations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Lấy chi tiết sự kiện
```bash
curl -X GET http://localhost:3000/api/events/{eventId}
```

---

## 🎨 UI Components Test

### Test Responsive:

1. **Desktop (≥1024px)**:
   - Grid 2 cột cho thông tin
   - Ảnh rộng full width
   - Buttons nằm ngang

2. **Tablet (768px - 1024px)**:
   - Grid vẫn 2 cột
   - Font size nhỏ hơn một chút

3. **Mobile (<768px)**:
   - Stack 1 cột
   - Ảnh vẫn full width
   - Buttons full width

### Test Loading States:

1. Khi vào trang lần đầu:
   - ✅ Hiển thị spinner
   - ✅ Không hiển thị nội dung

2. Khi đang đăng ký:
   - ✅ Button disabled
   - ✅ Text đổi thành "Đang đăng ký..."

3. Khi đang hủy:
   - ✅ Button disabled
   - ✅ Text đổi thành "Đang xử lý..."

### Test Error States:

1. Event không tồn tại:
   - ✅ Hiển thị "Không tìm thấy sự kiện"
   - ✅ Có nút "Quay lại danh sách sự kiện"

2. Network error:
   - ✅ Toast hiển thị lỗi
   - ✅ User có thể retry

---

## 📊 Database Check

### Kiểm tra data trong database:

```sql
-- Xem sự kiện
SELECT * FROM "Event" WHERE id = 'event-id-here';

-- Xem đăng ký
SELECT * FROM "Registration" WHERE "eventId" = 'event-id-here';

-- Xem đăng ký của user
SELECT * FROM "Registration" WHERE "userId" = 'user-id-here';

-- Count registrations
SELECT 
  e.title,
  COUNT(r.id) as total_registrations,
  e."maxParticipants"
FROM "Event" e
LEFT JOIN "Registration" r ON e.id = r."eventId" AND r.status = 'APPROVED'
WHERE e.id = 'event-id-here'
GROUP BY e.id;
```

---

## 🐛 Debug Tips

### 1. Registration không thành công:

**Check:**
- Token có hợp lệ không?
- User role có phải VOLUNTEER không?
- Event status có phải APPROVED không?
- Event có còn chỗ không?
- User đã đăng ký chưa?

**Debug:**
```javascript
// Trong browser console:
console.log(useAuthStore.getState());
console.log(event);
console.log(myRegistration);
```

### 2. UI không cập nhật sau đăng ký:

**Check:**
- `checkMyRegistration()` có được gọi sau khi đăng ký không?
- State `myRegistration` có được set không?

**Debug:**
```javascript
// Thêm log trong handleRegister:
console.log('Before register:', myRegistration);
await registrationService.registerForEvent(id!);
await checkMyRegistration();
console.log('After register:', myRegistration);
```

### 3. Button không hiển thị đúng:

**Check các function:**
```javascript
console.log('canRegister:', canRegister());
console.log('canCancelRegistration:', canCancelRegistration());
console.log('User role:', user?.role);
console.log('Event status:', event?.status);
console.log('My registration:', myRegistration);
```

---

## ✅ Acceptance Criteria Checklist

### Chức năng:
- [ ] Hiển thị đầy đủ thông tin sự kiện
- [ ] Volunteer có thể đăng ký sự kiện
- [ ] Volunteer có thể hủy đăng ký
- [ ] Admin/Manager không thể đăng ký
- [ ] Không cho đăng ký khi sự kiện đầy
- [ ] Không cho đăng ký khi sự kiện chưa duyệt
- [ ] Hiển thị trạng thái đăng ký hiện tại

### UI/UX:
- [ ] Loading state khi đang tải
- [ ] Disabled state khi đang xử lý
- [ ] Toast notification cho mọi action
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Badges có màu sắc phù hợp
- [ ] Images hiển thị đúng tỷ lệ

### Error Handling:
- [ ] Xử lý event không tồn tại
- [ ] Xử lý network error
- [ ] Xử lý unauthorized
- [ ] Hiển thị lỗi rõ ràng cho user
- [ ] Có cách để user retry

### Performance:
- [ ] Không gọi API không cần thiết
- [ ] Cache trạng thái đăng ký
- [ ] Loading nhanh, smooth

---

## 🎉 Success Metrics

Tính năng được coi là hoàn thành khi:

1. ✅ Volunteer có thể đăng ký sự kiện thành công
2. ✅ Volunteer có thể hủy đăng ký
3. ✅ Hiển thị đúng trạng thái đăng ký
4. ✅ UI responsive và user-friendly
5. ✅ Error handling đầy đủ
6. ✅ Tất cả test cases pass
7. ✅ No console errors
8. ✅ Performance tốt (< 2s load time)

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Console logs (F12)
2. Network tab (F12 → Network)
3. Backend logs
4. Database records
5. File HUONG_DAN_EVENT_DETAIL.md

Happy Testing! 🚀
