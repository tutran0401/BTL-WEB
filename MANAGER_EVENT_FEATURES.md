# 📋 Tính năng Quản lý Sự kiện - Manager

## ✅ Tổng quan các tính năng mới

### 1. Sửa/Chỉnh sửa Sự kiện ✨ NEW
Manager có thể chỉnh sửa thông tin sự kiện đã tạo.

**Các trường có thể sửa:**
- ✅ Tên sự kiện
- ✅ Mô tả chi tiết
- ✅ Địa điểm
- ✅ Danh mục (Category)
- ✅ Ngày bắt đầu / kết thúc
- ✅ Số người tham gia tối đa
- ✅ Hình ảnh (Upload hoặc URL)

**Lưu ý:**
- Chỉ Manager tạo sự kiện hoặc Admin mới có quyền sửa
- Sau khi sửa, sự kiện vẫn giữ nguyên trạng thái duyệt (APPROVED/PENDING/REJECTED)
- Upload ảnh hỗ trợ JPG, PNG, GIF, WebP - tối đa 5MB

---

### 2. Xóa Sự kiện ✅ (Đã có)
Manager có thể xóa sự kiện đã tạo.

**Điều kiện:**
- Chỉ Manager tạo sự kiện hoặc Admin mới có quyền xóa
- Hệ thống sẽ hiển thị confirmation dialog trước khi xóa

---

### 3. Báo cáo Danh sách Tình nguyện viên ✨ ENHANCED

#### 3.1. Xem danh sách trong Modal
Manager có thể xem danh sách tất cả tình nguyện viên đã đăng ký sự kiện.

**Thông tin hiển thị:**
- ✅ Họ tên
- ✅ Email
- ✅ Số điện thoại
- ✅ Trạng thái đăng ký (PENDING/APPROVED/REJECTED/CANCELLED/COMPLETED)
- ✅ Trạng thái hoàn thành

**Hành động:**
- ✅ Duyệt đăng ký (nếu status = PENDING)
- ✅ Từ chối đăng ký (nếu status = PENDING)
- ✅ Đánh dấu hoàn thành (nếu status = APPROVED và chưa hoàn thành)

#### 3.2. Export danh sách ra CSV ✨ NEW
Manager có thể export danh sách tình nguyện viên ra file CSV để lưu trữ hoặc phân tích.

**Cấu trúc file CSV:**
```csv
STT,Họ tên,Email,Số điện thoại,Trạng thái,Hoàn thành,Ngày đăng ký
1,"Nguyễn Văn A","a@gmail.com","0123456789","Đã duyệt","Có","15/12/2025"
2,"Trần Thị B","b@gmail.com","0987654321","Chờ duyệt","Không","14/12/2025"
...
```

**Tính năng:**
- ✅ Hỗ trợ tiếng Việt (UTF-8 BOM)
- ✅ Mở được bằng Excel, Google Sheets
- ✅ Tên file tự động: `danh-sach-tinh-nguyen-vien-{tên-sự-kiện}-{ngày}.csv`
- ✅ Hiển thị số lượng người đăng ký

---

## 🎯 Hướng dẫn sử dụng

### 1. Sửa sự kiện

**Bước 1:** Đăng nhập với tài khoản Manager

**Bước 2:** Vào trang "Quản lý sự kiện" (`/manager/events`)

**Bước 3:** Tìm sự kiện cần sửa

**Bước 4:** Click nút **Sửa** (icon Edit - bút chì)

**Bước 5:** Chỉnh sửa thông tin trong modal

**Bước 6:** Click **"Cập nhật sự kiện"**

✅ **Kết quả:** Toast hiển thị "Cập nhật sự kiện thành công!"

---

### 2. Xóa sự kiện

**Bước 1:** Đăng nhập với tài khoản Manager

**Bước 2:** Vào trang "Quản lý sự kiện" (`/manager/events`)

**Bước 3:** Tìm sự kiện cần xóa

**Bước 4:** Click nút **Xóa** (icon Trash - thùng rác màu đỏ)

**Bước 5:** Xác nhận trong dialog

✅ **Kết quả:** Toast hiển thị "Đã xóa sự kiện"

---

### 3. Xem và Export danh sách tình nguyện viên

**Bước 1:** Đăng nhập với tài khoản Manager

**Bước 2:** Vào trang "Quản lý sự kiện" (`/manager/events`)

**Bước 3:** Click nút **"Xem đăng ký"** (icon Eye)

**Bước 4:** Modal hiển thị danh sách tình nguyện viên

**Bước 5 (Tùy chọn):** Click **"Export CSV"** để tải file

✅ **Kết quả:** File CSV được tải về máy

---

## 🧪 Test Cases

### Test Case 1: Sửa sự kiện thành công
**Setup:**
- Đăng nhập: manager1@volunteerhub.com / 123456
- Có ít nhất 1 sự kiện

**Steps:**
1. Vào `/manager/events`
2. Click nút "Sửa" trên một sự kiện
3. Thay đổi tên sự kiện
4. Click "Cập nhật sự kiện"

**Expected:**
- ✅ Modal đóng lại
- ✅ Toast: "Cập nhật sự kiện thành công!"
- ✅ Sự kiện hiển thị thông tin mới
- ✅ Trạng thái duyệt không thay đổi

---

### Test Case 2: Xóa sự kiện thành công
**Steps:**
1. Vào `/manager/events`
2. Click nút "Xóa" (đỏ)
3. Confirm dialog

**Expected:**
- ✅ Toast: "Đã xóa sự kiện"
- ✅ Sự kiện biến mất khỏi danh sách

---

### Test Case 3: Export CSV
**Setup:**
- Có sự kiện với ít nhất 3 người đăng ký

**Steps:**
1. Vào `/manager/events`
2. Click "Xem đăng ký"
3. Click "Export CSV"

**Expected:**
- ✅ File CSV tải về
- ✅ Tên file: `danh-sach-tinh-nguyen-vien-{event-name}-{date}.csv`
- ✅ Mở bằng Excel hiển thị đúng tiếng Việt
- ✅ Có đầy đủ thông tin: STT, Họ tên, Email, SĐT, Trạng thái, Ngày đăng ký

---

### Test Case 4: Upload ảnh khi sửa sự kiện
**Steps:**
1. Click "Sửa" sự kiện
2. Click vùng "Chọn ảnh từ máy tính"
3. Chọn file ảnh JPG (<5MB)
4. Đợi upload xong
5. Click "Cập nhật sự kiện"

**Expected:**
- ✅ Hiển thị "Đang tải lên..."
- ✅ Toast: "Upload ảnh thành công!"
- ✅ Preview ảnh hiển thị
- ✅ Sự kiện cập nhật với ảnh mới

---

### Test Case 5: Validation
**Steps:**
1. Click "Sửa" sự kiện
2. Xóa tên sự kiện (để trống)
3. Click "Cập nhật sự kiện"

**Expected:**
- ✅ Browser validation: "Please fill out this field"
- ✅ Form không submit

---

### Test Case 6: Export CSV với 0 đăng ký
**Setup:**
- Sự kiện chưa có ai đăng ký

**Steps:**
1. Click "Xem đăng ký"
2. Hiển thị "Chưa có người đăng ký"

**Expected:**
- ✅ Không hiển thị nút "Export CSV"
- ✅ Hiển thị icon Users và message

---

## 🔗 API Endpoints

### 1. Update Event
```
PUT /api/events/:id
Authorization: Bearer {token}
Body: {
  title: string,
  description: string,
  location: string,
  startDate: string (ISO),
  endDate: string (ISO),
  category: EventCategory,
  maxParticipants?: number,
  imageUrl?: string
}
```

### 2. Delete Event
```
DELETE /api/events/:id
Authorization: Bearer {token}
```

### 3. Get Event Registrations
```
GET /api/registrations/events/:eventId/registrations
Authorization: Bearer {token}
Query: ?status=APPROVED (optional)
```

---

## 📝 Files Modified

### Frontend
- ✅ `frontend/src/pages/manager/ManageEventsPage.tsx`
  - Added `EditEventModal` component
  - Added `handleEdit` function
  - Added `exportToCSV` function
  - Added `showEditModal` state
  - Added Export CSV button in registrations modal

### Backend (Đã có sẵn)
- ✅ `backend/src/controllers/event.controller.ts` - updateEvent, deleteEvent
- ✅ `backend/src/routes/event.routes.ts` - PUT /:id, DELETE /:id
- ✅ `backend/src/controllers/registration.controller.ts` - getEventRegistrations
- ✅ `backend/src/routes/registration.routes.ts` - GET /events/:eventId/registrations

---

## 🎨 UI/UX

### Nút hành động
```
[👁️ Xem đăng ký] [✏️ Sửa] [🗑️ Xóa]
   Outline          Secondary  Danger
```

### Modal Registrations
```
┌────────────────────────────────────────────┐
│  Danh sách đăng ký - Tên sự kiện      [✕] │
├────────────────────────────────────────────┤
│  Tổng số: 5 người đăng ký   [📥 Export CSV] │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐ │
│  │ Nguyễn Văn A                         │ │
│  │ a@gmail.com                          │ │
│  │ 0123456789                           │ │
│  │ [Đã duyệt]          [✓ Duyệt] [✕]  │ │
│  └──────────────────────────────────────┘ │
│  ...                                       │
└────────────────────────────────────────────┘
```

---

## 💡 Tips & Best Practices

1. **Backup trước khi xóa:** Hãy export danh sách tình nguyện viên trước khi xóa sự kiện
2. **Kiểm tra thông tin:** Xem lại kỹ thông tin trước khi click "Cập nhật"
3. **Upload ảnh:** Nên dùng ảnh có kích thước phù hợp (khuyến nghị: 1200x600px)
4. **CSV Encoding:** File CSV hỗ trợ UTF-8 BOM để Excel đọc đúng tiếng Việt

---

## 🐛 Troubleshooting

### Issue 1: Không upload được ảnh
**Giải pháp:**
- Kiểm tra kích thước file (<5MB)
- Kiểm tra định dạng (JPG, PNG, GIF, WebP)
- Kiểm tra token đăng nhập (có thể hết hạn → login lại)

### Issue 2: CSV không hiển thị đúng tiếng Việt
**Giải pháp:**
- Mở bằng Excel → Data → From Text/CSV → chọn encoding UTF-8
- Hoặc import vào Google Sheets (tự động nhận UTF-8)

### Issue 3: Không sửa được sự kiện
**Giải pháp:**
- Kiểm tra quyền: Phải là Manager tạo sự kiện hoặc Admin
- Kiểm tra validation: Tất cả trường bắt buộc phải điền

---

## ✅ Checklist hoàn thành

### Tính năng Sửa sự kiện
- [x] EditEventModal component
- [x] handleEdit function
- [x] Hiển thị dữ liệu hiện tại
- [x] Upload/URL image
- [x] Validation form
- [x] API integration
- [x] Toast notifications
- [x] Loading states

### Tính năng Export CSV
- [x] exportToCSV function
- [x] CSV formatting với BOM
- [x] Download file
- [x] Tên file tự động
- [x] Export button UI
- [x] Hiển thị tổng số người đăng ký
- [x] Toast notification

### Testing
- [x] Test sửa sự kiện
- [x] Test xóa sự kiện
- [x] Test export CSV
- [x] Test validation
- [x] Test với 0 đăng ký
- [x] Test upload ảnh

---

## 🎯 Success Criteria

Tính năng được coi là hoàn thành khi:

1. ✅ Manager có thể sửa sự kiện của mình
2. ✅ Manager có thể xóa sự kiện của mình
3. ✅ Manager có thể xem danh sách tình nguyện viên
4. ✅ Manager có thể export danh sách ra CSV
5. ✅ UI đẹp, responsive
6. ✅ Error handling đầy đủ
7. ✅ Loading states
8. ✅ Toast notifications
9. ✅ CSV hỗ trợ tiếng Việt
10. ✅ Tất cả test cases pass

---

**Tài liệu được tạo:** 15/12/2025  
**Phiên bản:** 1.0  
**Tác giả:** AI Assistant

🎉 **Chúc mừng! Tất cả tính năng đã hoàn thành!**

