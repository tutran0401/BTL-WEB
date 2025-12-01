# Tính năng Xã hội (Social Features)

## Tổng quan
Tính năng xã hội cho phép tình nguyện viên tương tác với nhau thông qua việc đăng bài (Posts) và bình luận (Comments) trong trang chi tiết sự kiện.

## Các tính năng đã triển khai

### 1. Đăng bài (Posts)
- ✅ Hiển thị danh sách bài viết của sự kiện
- ✅ Tạo bài viết mới (văn bản + hình ảnh tùy chọn)
- ✅ Xóa bài viết (chỉ tác giả hoặc admin)
- ✅ Like/Unlike bài viết
- ✅ Đếm số lượt thích và bình luận

### 2. Bình luận (Comments)
- ✅ Hiển thị danh sách bình luận của bài viết
- ✅ Thêm bình luận mới
- ✅ Xóa bình luận (chỉ tác giả hoặc admin)
- ✅ Hiển thị thời gian đăng (relative time)

### 3. UI/UX
- ✅ Giao diện thân thiện và responsive
- ✅ Avatar người dùng (hoặc ký tự đầu nếu không có avatar)
- ✅ Hiển thị trạng thái loading
- ✅ Empty state khi chưa có bài viết
- ✅ Form tạo bài viết có thể thu gọn/mở rộng

## Cấu trúc file

### Frontend
```
frontend/src/
├── services/
│   ├── postService.ts           # API calls cho posts
│   └── commentService.ts        # API calls cho comments
├── components/
│   └── social/
│       ├── index.ts             # Export components
│       ├── PostList.tsx         # Danh sách posts + form tạo mới
│       ├── PostCard.tsx         # Card hiển thị một post
│       └── CommentList.tsx      # Danh sách comments + form tạo mới
└── pages/
    └── events/
        └── EventDetailPage.tsx  # Trang chi tiết sự kiện (đã tích hợp PostList)
```

### Backend (đã có sẵn)
```
backend/src/
├── controllers/
│   ├── post.controller.ts       # Logic xử lý posts
│   └── comment.controller.ts    # Logic xử lý comments
└── routes/
    ├── post.routes.ts           # Routes cho posts
    └── comment.routes.ts        # Routes cho comments
```

## API Endpoints

### Posts
- `GET /api/posts/events/:eventId` - Lấy danh sách posts của sự kiện
- `POST /api/posts/events/:eventId` - Tạo post mới
- `DELETE /api/posts/:id` - Xóa post
- `POST /api/posts/:id/like` - Like/Unlike post

### Comments
- `GET /api/comments/posts/:postId` - Lấy danh sách comments của post
- `POST /api/comments/posts/:postId` - Tạo comment mới
- `DELETE /api/comments/:id` - Xóa comment

## Quyền truy cập

### Posts
- **Xem**: Tất cả người dùng đã đăng nhập
- **Tạo**: Tất cả người dùng đã đăng nhập (có thể giới hạn cho người đã đăng ký sự kiện)
- **Xóa**: Tác giả hoặc Admin
- **Like**: Tất cả người dùng đã đăng nhập

### Comments
- **Xem**: Tất cả người dùng đã đăng nhập
- **Tạo**: Tất cả người dùng đã đăng nhập
- **Xóa**: Tác giả hoặc Admin

## Điều kiện hiển thị

Bảng tin sự kiện chỉ hiển thị khi:
- Sự kiện có trạng thái `APPROVED`
- Người dùng truy cập trang chi tiết sự kiện

## Cách sử dụng

### Cho người dùng cuối
1. Truy cập trang chi tiết sự kiện
2. Cuộn xuống phần "Bảng tin sự kiện"
3. Nhấn "✏️ Viết bài" để tạo bài viết mới
4. Nhập nội dung và URL hình ảnh (tùy chọn)
5. Nhấn "Đăng bài"
6. Tương tác với bài viết: Like, Bình luận

### Cho developer
```tsx
// Sử dụng PostList component
import { PostList } from '../../components/social';

function EventDetailPage() {
  return (
    <div>
      {/* ... other content ... */}
      
      {event.status === 'APPROVED' && (
        <div className="mt-8">
          <PostList eventId={event.id} />
        </div>
      )}
    </div>
  );
}
```

## Tính năng nâng cao có thể thêm

### Đề xuất
- [ ] Upload ảnh trực tiếp (thay vì URL)
- [ ] Rich text editor cho bài viết
- [ ] Mentions (@username)
- [ ] Hashtags
- [ ] Share bài viết
- [ ] Edit bài viết/bình luận
- [ ] Phân trang cho posts và comments
- [ ] Real-time updates với Socket.IO
- [ ] Reactions (không chỉ like)
- [ ] Báo cáo nội dung vi phạm
- [ ] Pin bài viết quan trọng

### Performance
- [ ] Lazy loading cho images
- [ ] Virtual scrolling cho danh sách dài
- [ ] Optimize re-renders
- [ ] Cache API responses

## Testing

### Frontend
```bash
cd frontend
npm run dev
```
- Truy cập http://localhost:5173/events/:id
- Test các tính năng:
  - Tạo bài viết
  - Like/Unlike
  - Thêm bình luận
  - Xóa bài viết/bình luận

### Backend
Backend đã có sẵn controllers và routes, đảm bảo server đang chạy:
```bash
cd backend
npm run dev
```

## Lưu ý
- Tất cả API calls đều yêu cầu authentication (JWT token)
- Lỗi sẽ được hiển thị bằng toast notifications
- Loading states được xử lý cho trải nghiệm người dùng tốt hơn
- Responsive design cho mobile và desktop

## Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra token trong localStorage
- Đăng nhập lại

### Không thể tạo bài viết
- Kiểm tra sự kiện có trạng thái APPROVED không
- Kiểm tra backend server đang chạy

### Lỗi import module
- Chạy `npm install` trong thư mục frontend
- Restart dev server

## Liên hệ
Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên repository.
