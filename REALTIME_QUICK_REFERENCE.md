# Quick Reference: Real-time Events

## Tất cả các hành động trigger Dashboard refresh

### ✅ CÓ Real-time Updates

| Hành động | Event Name | Controller |
|-----------|------------|------------|
| 📝 **Tạo post** | `post:created` | post.controller.ts |
| 🗑️ **Xóa post** | `post:updated` / `post:deleted` | post.controller.ts |
| 💬 **Tạo comment** | `comment:created` | comment.controller.ts |
| 🗑️ **Xóa comment** | `comment:deleted` | comment.controller.ts |
| ❤️ **Like post** | `like:created` | post.controller.ts |
| 💔 **Unlike post** | `like:removed` | post.controller.ts |
| 📋 **Đăng ký event** | `registration:created` | registration.controller.ts |
| ✅ **Duyệt đăng ký** | `registration:approved` | registration.controller.ts |
| ❌ **Từ chối đăng ký** | `registration:rejected` | registration.controller.ts |
| 🚫 **Hủy đăng ký** | `registration:cancelled` | registration.controller.ts |
| 🎉 **Hoàn thành event** | `registration:completed` | registration.controller.ts |
| ✅ **Admin duyệt event** | `event:approved` | event.controller.ts |
| ❌ **Admin từ chối event** | `event:rejected` | event.controller.ts |
| 📝 **Cập nhật event** | `event:updated` | event.controller.ts |
| 🗑️ **Xóa event** | `event:deleted` | event.controller.ts |

**Total: 16 events** ✅

---

## How it works

```
Action → Backend emits event → Frontend listens → Debounce 2s → Refresh dashboard
```

---

## Testing Steps

1. **Mở Dashboard** trong 1 tab
2. **Thực hiện bất kỳ action nào** ở trên (tab khác hoặc API)
3. **Chờ tối đa 2 giây**
4. **Dashboard tự động refresh!** 🎉

---

## Troubleshooting

### Dashboard không update?

1. ✅ Check console: `✅ Socket connected: <id>`
2. ✅ Check console: `📊 Dashboard update triggered - refreshing data...`
3. ✅ Backend đang chạy?
4. ✅ Refresh hard (Ctrl+Shift+R)

### Refresh quá nhiều lần?

- ✅ Đó là debouncing! Nó sẽ chỉ refresh 1 lần sau 2s từ event cuối cùng

---

## Files Changed

**Backend:**
- `backend/src/controllers/post.controller.ts`
- `backend/src/controllers/comment.controller.ts`
- `backend/src/controllers/registration.controller.ts`
- `backend/src/controllers/event.controller.ts`

**Frontend:**
- `frontend/src/pages/dashboard/DashboardPage.tsx`

**Docs:**
- `REALTIME_FIX_SUMMARY.md`
- `COMPLETE_REALTIME_EVENTS.md`
- `REALTIME_QUICK_REFERENCE.md` (this file)
