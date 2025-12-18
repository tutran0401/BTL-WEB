# PRD – Tính năng Xem Dashboard

## 1. Tổng quan

**Tên tính năng:** Dashboard tổng quan
**Sản phẩm:** VolunteerHub
**Mục tiêu:** Cung cấp cho người dùng cái nhìn nhanh, trực quan về các hoạt động tình nguyện, trạng thái tham gia và các số liệu nổi bật, giúp họ ra quyết định và thao tác nhanh hơn.

## 2. Đối tượng sử dụng

Dashboard được cá nhân hóa theo **vai trò người dùng**:

* **Tình nguyện viên**
* **Quản lý sự kiện**
* **Admin hệ thống**

## 4. Phạm vi tính năng

Dashboard **chỉ mang tính tổng hợp và hiển thị**, không thay thế các màn hình quản lý chi tiết.

---

## 5. Yêu cầu chức năng (Áp dụng cho cả 3 vai trò)

> **Theo yêu cầu đề bài:** Dashboard của **tất cả các role** đều phải hiển thị **tổng hợp các sự kiện liên quan**, bao gồm:
>
> * Sự kiện **mới công bố**
> * Sự kiện **có tin bài / trao đổi mới**
> * Sự kiện **thu hút** (tăng nhanh số thành viên / trao đổi / lượt like)

Dashboard **không phân hóa logic cốt lõi theo role**, chỉ khác nhau về **phạm vi dữ liệu được phép xem**.

---

### 5.1 Nội dung hiển thị chính trên Dashboard

#### 1. Sự kiện mới công bố

* Danh sách các sự kiện vừa được duyệt và công khai
* Thông tin hiển thị:

  * Tên sự kiện
  * Đơn vị tổ chức
  * Thời gian bắt đầu
  * Ngày công bố
* Sắp xếp theo: *Ngày công bố giảm dần*

#### 2. Sự kiện có tin bài / trao đổi mới

* Các sự kiện có hoạt động mới trong kênh trao đổi (post, comment)
* Thông tin hiển thị:

  * Tên sự kiện
  * Thời gian cập nhật gần nhất
  * Số bài viết / bình luận mới
* Mục tiêu: giúp người dùng nhanh chóng quay lại các sự kiện đang sôi động

#### 3. Sự kiện thu hút (Trending Events)

* Các sự kiện có mức độ tương tác tăng nhanh trong khoảng thời gian gần
* Tiêu chí đánh giá (có thể kết hợp):

  * Số lượng thành viên tham gia tăng nhanh
  * Số bài viết / bình luận tăng nhanh
  * Số lượt like tăng nhanh
* Thông tin hiển thị:

  * Tên sự kiện
  * Số người tham gia
  * Chỉ số tương tác nổi bật (ví dụ: +20 thành viên / 24h)

---

### 5.2 Phạm vi dữ liệu theo vai trò

* **Tình nguyện viên:**

  * Xem tất cả sự kiện công khai
  * Ưu tiên hiển thị sự kiện đã/đang tham gia

* **Quản lý sự kiện:**

  * Xem tất cả sự kiện công khai
  * Ưu tiên sự kiện do mình tạo

* **Admin:**

  * Xem toàn bộ sự kiện trong hệ thống
  * Không ưu tiên cá nhân hóa


## 7. Giả định & ràng buộc

* Người dùng đã đăng nhập mới truy cập được dashboard
* Dữ liệu được lấy từ backend qua API (JSON)
* Dashboard không cho chỉnh sửa dữ liệu trực tiếp

