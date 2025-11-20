import { PrismaClient, EventCategory, EventStatus, RegistrationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@volunteerhub.com' },
    update: {},
    create: {
      email: 'admin@volunteerhub.com',
      password: hashedPassword,
      fullName: 'Admin User',
      phone: '0123456789',
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
    },
  });

  console.log('✅ Created admin:', admin.email);

  // Create Event Managers
  const manager1 = await prisma.user.upsert({
    where: { email: 'manager1@volunteerhub.com' },
    update: {},
    create: {
      email: 'manager1@volunteerhub.com',
      password: hashedPassword,
      fullName: 'Nguyễn Văn Quản Lý',
      phone: '0987654321',
      role: 'EVENT_MANAGER',
      accountStatus: 'ACTIVE',
    },
  });

  const manager2 = await prisma.user.upsert({
    where: { email: 'manager2@volunteerhub.com' },
    update: {},
    create: {
      email: 'manager2@volunteerhub.com',
      password: hashedPassword,
      fullName: 'Trần Thị Tổ Chức',
      phone: '0976543210',
      role: 'EVENT_MANAGER',
      accountStatus: 'ACTIVE',
    },
  });

  console.log('✅ Created managers:', manager1.email, manager2.email);

  // Create Volunteers
  const volunteers: Awaited<ReturnType<typeof prisma.user.upsert>>[] = [];
  for (let i = 1; i <= 10; i++) {
    const volunteer = await prisma.user.upsert({
      where: { email: `volunteer${i}@volunteerhub.com` },
      update: {},
      create: {
        email: `volunteer${i}@volunteerhub.com`,
        password: hashedPassword,
        fullName: `Tình Nguyện Viên ${i}`,
        phone: `09${String(i).padStart(8, '0')}`,
        role: 'VOLUNTEER',
        accountStatus: 'ACTIVE',
      },
    });
    volunteers.push(volunteer);
  }

  console.log(`✅ Created ${volunteers.length} volunteers`);

  // Create Events
  const now = new Date();
  const events = [
    {
      title: 'Trồng cây xanh tại công viên Thống Nhất',
      description: 'Cùng nhau trồng 1000 cây xanh để góp phần cải thiện môi trường và không khí tại thành phố. Chúng tôi sẽ cung cấp đầy đủ dụng cụ và hướng dẫn kỹ thuật trồng cây.',
      location: 'Công viên Thống Nhất, Hà Nội',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 hours
      category: EventCategory.TREE_PLANTING,
      status: EventStatus.APPROVED,
      maxParticipants: 50,
      imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
      managerId: manager1.id,
    },
    {
      title: 'Dọn vệ sinh bờ hồ Tây',
      description: 'Hoạt động dọn rác và làm sạch khu vực xung quanh hồ Tây. Mang theo găng tay và túi rác. Chúng tôi sẽ cung cấp thêm dụng cụ hỗ trợ.',
      location: 'Hồ Tây, Hà Nội',
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      category: EventCategory.CLEANING,
      status: EventStatus.APPROVED,
      maxParticipants: 30,
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
      managerId: manager2.id,
    },
    {
      title: 'Từ thiện tại trại trẻ mồ côi',
      description: 'Đến thăm và tặng quà cho các em nhỏ tại trại trẻ mồ côi. Chương trình bao gồm: trao quà, vui chơi cùng các em, và dọn dẹp khu vực.',
      location: 'Trại trẻ mồ côi Hà Nội',
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      category: EventCategory.CHARITY,
      status: EventStatus.APPROVED,
      maxParticipants: 20,
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
      managerId: manager1.id,
    },
    {
      title: 'Dạy máy tính cho người cao tuổi',
      description: 'Hướng dẫn người cao tuổi sử dụng smartphone, máy tính và internet cơ bản. Giúp họ kết nối với gia đình và cộng đồng thông qua công nghệ.',
      location: 'Trung tâm văn hóa quận Hoàn Kiếm',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      category: EventCategory.DIGITAL_LITERACY,
      status: EventStatus.APPROVED,
      maxParticipants: 15,
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      managerId: manager2.id,
    },
    {
      title: 'Dạy học miễn phí cho trẻ em vùng cao',
      description: 'Tổ chức lớp học miễn phí các môn Toán, Văn, Anh cho trẻ em vùng cao. Cần tình nguyện viên có kiến thức và kỹ năng giảng dạy.',
      location: 'Xã Tà Xùa, Sơn La',
      startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
      category: EventCategory.EDUCATION,
      status: EventStatus.APPROVED,
      maxParticipants: 10,
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      managerId: manager1.id,
    },
    {
      title: 'Khám bệnh từ thiện',
      description: 'Chương trình khám bệnh, cấp thuốc miễn phí cho người nghèo và người cao tuổi. Có sự tham gia của các bác sĩ tình nguyện.',
      location: 'Nhà văn hóa xã Đông Anh',
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      category: EventCategory.HEALTHCARE,
      status: EventStatus.PENDING,
      maxParticipants: 25,
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
      managerId: manager2.id,
    },
  ];

  const createdEvents: Awaited<ReturnType<typeof prisma.event.create>>[] = [];
  for (const eventData of events) {
    const event = await prisma.event.create({
      data: eventData,
    });
    createdEvents.push(event);
    console.log(`✅ Created event: ${event.title}`);
  }

  // Create Registrations
  const approvedEvents = createdEvents.filter(e => e.status === EventStatus.APPROVED);
  
  for (const event of approvedEvents.slice(0, 3)) {
    // Register 5-8 random volunteers for each event
    const numRegistrations = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < numRegistrations; i++) {
      const volunteer = volunteers[i];
      await prisma.registration.create({
        data: {
          userId: volunteer.id,
          eventId: event.id,
          status: RegistrationStatus.APPROVED,
          isCompleted: false,
        },
      });
    }
    console.log(`✅ Created ${numRegistrations} registrations for: ${event.title}`);
  }

  // Create some posts and comments
  const eventWithPosts = createdEvents[0];
  
  const post1 = await prisma.post.create({
    data: {
      content: 'Rất mong chờ được tham gia sự kiện này! Mình sẽ mang theo bạn bè cùng đi. 🌳',
      authorId: volunteers[0].id,
      eventId: eventWithPosts.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content: 'Sự kiện ý nghĩa quá! Mọi người nhớ mang theo nước uống và kem chống nắng nhé! ☀️',
      authorId: volunteers[1].id,
      eventId: eventWithPosts.id,
    },
  });

  console.log('✅ Created sample posts');

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Cảm ơn bạn đã chia sẻ! Mình cũng sẽ chuẩn bị kỹ lưỡng.',
      authorId: volunteers[2].id,
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Good idea! Mình sẽ mang thêm mũ nữa.',
      authorId: volunteers[3].id,
      postId: post2.id,
    },
  });

  console.log('✅ Created sample comments');

  // Create likes
  await prisma.like.create({
    data: {
      userId: volunteers[2].id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: volunteers[3].id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: volunteers[0].id,
      postId: post2.id,
    },
  });

  console.log('✅ Created sample likes');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Test Accounts:');
  console.log('Admin: admin@volunteerhub.com / 123456');
  console.log('Manager: manager1@volunteerhub.com / 123456');
  console.log('Volunteer: volunteer1@volunteerhub.com / 123456');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

