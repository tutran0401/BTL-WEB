/**
 * EventDetailPage Test Utilities
 * 
 * Copy các functions này vào browser console để test/debug
 */

// ============================================
// 1. CHECK AUTH
// ============================================

// Kiểm tra trạng thái authentication
function checkAuth() {
  const auth = useAuthStore.getState();
  console.table({
    'Đã đăng nhập': auth.isAuthenticated,
    'User ID': auth.user?.id,
    'Email': auth.user?.email,
    'Role': auth.user?.role,
    'Token': auth.token?.substring(0, 20) + '...'
  });
  return auth;
}

// Kiểm tra token hợp lệ
async function validateToken() {
  try {
    const response = await api.get('/auth/profile');
    console.log('✅ Token hợp lệ:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Token không hợp lệ:', error);
    return false;
  }
}

// ============================================
// 2. EVENT UTILITIES
// ============================================

// Lấy thông tin event
async function getEventInfo(eventId) {
  try {
    const event = await eventService.getEventById(eventId);
    console.table({
      'ID': event.id,
      'Tiêu đề': event.title,
      'Status': event.status,
      'Category': event.category,
      'Manager': event.manager?.fullName,
      'Đã đăng ký': event._count?.registrations || 0,
      'Giới hạn': event.maxParticipants || 'Không giới hạn',
      'Còn chỗ': event.maxParticipants ? event.maxParticipants - (event._count?.registrations || 0) : '∞'
    });
    console.log('📅 Thời gian:', {
      start: new Date(event.startDate).toLocaleString('vi-VN'),
      end: new Date(event.endDate).toLocaleString('vi-VN')
    });
    return event;
  } catch (error) {
    console.error('❌ Lỗi lấy event:', error);
  }
}

// ============================================
// 3. REGISTRATION UTILITIES
// ============================================

// Kiểm tra đăng ký hiện tại
async function checkRegistration(eventId) {
  try {
    const { registrations } = await registrationService.getMyRegistrations();
    const myReg = registrations.find(r => r.eventId === eventId);
    
    if (myReg) {
      console.log('✅ Đã đăng ký sự kiện này:');
      console.table({
        'ID': myReg.id,
        'Status': myReg.status,
        'Đăng ký lúc': new Date(myReg.createdAt).toLocaleString('vi-VN'),
        'Hoàn thành': myReg.isCompleted ? 'Có' : 'Chưa'
      });
      return myReg;
    } else {
      console.log('ℹ️ Chưa đăng ký sự kiện này');
      return null;
    }
  } catch (error) {
    console.error('❌ Lỗi kiểm tra đăng ký:', error);
  }
}

// Lấy tất cả đăng ký của tôi
async function getMyRegistrations() {
  try {
    const { registrations } = await registrationService.getMyRegistrations();
    console.log(`📋 Tổng số đăng ký: ${registrations.length}`);
    registrations.forEach((reg, index) => {
      console.log(`\n${index + 1}. ${reg.event?.title}`);
      console.table({
        'Event ID': reg.eventId,
        'Status': reg.status,
        'Ngày đăng ký': new Date(reg.createdAt).toLocaleString('vi-VN')
      });
    });
    return registrations;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách đăng ký:', error);
  }
}

// ============================================
// 4. REGISTRATION ACTIONS
// ============================================

// Đăng ký sự kiện
async function testRegister(eventId) {
  console.log('🔄 Đang đăng ký...');
  try {
    const result = await registrationService.registerForEvent(eventId);
    console.log('✅ Đăng ký thành công:', result);
    await checkRegistration(eventId);
    return result;
  } catch (error) {
    console.error('❌ Đăng ký thất bại:', error.response?.data || error);
  }
}

// Hủy đăng ký
async function testCancel(eventId) {
  console.log('🔄 Đang hủy đăng ký...');
  try {
    const result = await registrationService.cancelRegistration(eventId);
    console.log('✅ Hủy thành công:', result);
    await checkRegistration(eventId);
    return result;
  } catch (error) {
    console.error('❌ Hủy thất bại:', error.response?.data || error);
  }
}

// ============================================
// 5. VALIDATION CHECKS
// ============================================

// Kiểm tra có thể đăng ký không
async function canRegisterEvent(eventId) {
  const auth = useAuthStore.getState();
  const event = await getEventInfo(eventId);
  const myReg = await checkRegistration(eventId);
  
  const checks = {
    '✓ Đã đăng nhập': auth.isAuthenticated,
    '✓ Role VOLUNTEER': auth.user?.role === 'VOLUNTEER',
    '✓ Chưa đăng ký': !myReg,
    '✓ Event APPROVED': event.status === 'APPROVED',
    '✓ Còn chỗ': !event.maxParticipants || (event._count?.registrations || 0) < event.maxParticipants
  };
  
  console.table(checks);
  
  const canRegister = Object.values(checks).every(v => v === true);
  console.log(canRegister ? '✅ CÓ THỂ ĐĂNG KÝ' : '❌ KHÔNG THỂ ĐĂNG KÝ');
  
  return canRegister;
}

// Kiểm tra có thể hủy không
async function canCancelRegistration(eventId) {
  const myReg = await checkRegistration(eventId);
  
  if (!myReg) {
    console.log('❌ Chưa đăng ký sự kiện này');
    return false;
  }
  
  const checks = {
    '✓ Status != COMPLETED': myReg.status !== 'COMPLETED',
    '✓ Status != CANCELLED': myReg.status !== 'CANCELLED'
  };
  
  console.table(checks);
  
  const canCancel = Object.values(checks).every(v => v === true);
  console.log(canCancel ? '✅ CÓ THỂ HỦY' : '❌ KHÔNG THỂ HỦY');
  
  return canCancel;
}

// ============================================
// 6. FULL TEST FLOW
// ============================================

// Test toàn bộ flow
async function testFullFlow(eventId) {
  console.log('🚀 BẮT ĐẦU TEST FULL FLOW\n');
  
  // Step 1: Check auth
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 BƯỚC 1: Kiểm tra authentication');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const auth = checkAuth();
  if (!auth.isAuthenticated) {
    console.error('❌ Chưa đăng nhập. Vui lòng login trước.');
    return;
  }
  
  // Step 2: Get event info
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 BƯỚC 2: Lấy thông tin sự kiện');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const event = await getEventInfo(eventId);
  if (!event) return;
  
  // Step 3: Check current registration
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 BƯỚC 3: Kiểm tra đăng ký hiện tại');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const myReg = await checkRegistration(eventId);
  
  // Step 4: Check if can register
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 BƯỚC 4: Kiểm tra điều kiện đăng ký');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const canReg = await canRegisterEvent(eventId);
  
  // Step 5: Test register (if can)
  if (canReg && !myReg) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 BƯỚC 5: Test đăng ký');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await testRegister(eventId);
  }
  
  // Step 6: Test cancel (if can)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 BƯỚC 6: Kiểm tra điều kiện hủy');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const canCan = await canCancelRegistration(eventId);
  
  console.log('\n✅ HOÀN THÀNH TEST FLOW');
}

// ============================================
// 7. QUICK COMMANDS
// ============================================

// Commands dễ nhớ
const commands = {
  // Auth
  auth: checkAuth,
  validateToken,
  
  // Event
  event: getEventInfo,
  
  // Registration
  check: checkRegistration,
  myRegs: getMyRegistrations,
  
  // Actions
  register: testRegister,
  cancel: testCancel,
  
  // Validation
  canRegister: canRegisterEvent,
  canCancel: canCancelRegistration,
  
  // Full test
  test: testFullFlow
};

// Hiển thị hướng dẫn
function help() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║          EVENT DETAIL PAGE - TEST UTILITIES               ║
╚═══════════════════════════════════════════════════════════╝

📌 QUICK COMMANDS:

Authentication:
  commands.auth()                    → Kiểm tra auth
  commands.validateToken()           → Validate token

Event Info:
  commands.event(eventId)            → Xem thông tin event

Registration:
  commands.check(eventId)            → Check đã đăng ký chưa
  commands.myRegs()                  → Xem tất cả đăng ký

Actions:
  commands.register(eventId)         → Đăng ký sự kiện
  commands.cancel(eventId)           → Hủy đăng ký

Validation:
  commands.canRegister(eventId)      → Check có thể đăng ký
  commands.canCancel(eventId)        → Check có thể hủy

Full Test:
  commands.test(eventId)             → Test toàn bộ flow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 VÍ DỤ SỬ DỤNG:

// Lấy event ID từ URL
const eventId = window.location.pathname.split('/').pop();

// Test đầy đủ
commands.test(eventId);

// Hoặc test từng bước
commands.auth();
commands.event(eventId);
commands.canRegister(eventId);
commands.register(eventId);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

// Auto show help
help();

// Export for use
window.testUtils = commands;
window.testUtils.help = help;

console.log('✅ Test utilities loaded! Type "testUtils.help()" for commands');
