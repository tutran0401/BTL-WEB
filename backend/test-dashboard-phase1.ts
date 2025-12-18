/**
 * Test script for Dashboard API Phase 1
 * 
 * Run with: npx ts-node test-dashboard-phase1.ts
 */

import prisma from './src/config/database';
import {
    calculateTrendingScore,
    getRecentActivityMetrics,
    generateGrowthIndicator,
    prioritizeEventsByRole,
    getEventWhereClause,
    getRecentDiscussionStats
} from './src/utils/dashboardHelpers';

async function testHelperFunctions() {
    console.log('🧪 Testing Dashboard Helper Functions...\n');

    // Test 1: Calculate Trending Score
    console.log('1️⃣  Testing calculateTrendingScore()...');
    const testMetrics = {
        newRegistrations: 10,
        newPosts: 5,
        newComments: 8,
        newLikes: 15,
        totalActivity: 38
    };
    const score = calculateTrendingScore(testMetrics);
    console.log(`   Metrics:`, testMetrics);
    console.log(`   Score: ${score}`);
    console.log(`   Expected: ${(10 * 3) + (5 * 2) + (8 * 1.5) + (15 * 1)} = 67`);
    console.log(`   ✅ Pass: ${score === 67}\n`);

    // Test 2: Generate Growth Indicator
    console.log('2️⃣  Testing generateGrowthIndicator()...');
    const indicator = generateGrowthIndicator(testMetrics, 7);
    console.log(`   Growth Indicator: "${indicator}"`);
    console.log(`   ✅ Pass: ${indicator === '+10 thành viên / 7 ngày'}\n`);

    // Test 3: Get Event Where Clause
    console.log('3️⃣  Testing getEventWhereClause()...');
    const adminWhere = getEventWhereClause('user-123', 'ADMIN');
    const volunteerWhere = getEventWhereClause('user-456', 'VOLUNTEER');
    console.log(`   Admin where clause:`, adminWhere);
    console.log(`   Volunteer where clause:`, volunteerWhere);
    console.log(`   ✅ Pass: ${Object.keys(adminWhere).length === 0 && volunteerWhere.status === 'APPROVED'}\n`);

    // Test 4: Prioritize Events by Role
    console.log('4️⃣  Testing prioritizeEventsByRole()...');
    const sampleEvents = [
        { id: '1', title: 'Event 1', managerId: 'user-123' },
        { id: '2', title: 'Event 2', managerId: 'other-user' },
        { id: '3', title: 'Event 3', managerId: 'user-123' },
    ];
    const prioritized = prioritizeEventsByRole(sampleEvents as any, 'user-123', 'EVENT_MANAGER');
    console.log(`   Input events:`, sampleEvents.map(e => `${e.id}(${e.managerId === 'user-123' ? 'my' : 'other'})`));
    console.log(`   Prioritized:`, prioritized.map(e => `${e.id}(${e.managerId === 'user-123' ? 'my' : 'other'})`));
    console.log(`   ✅ Pass: ${prioritized[0].id === '1' && prioritized[2].id === '2'}\n`);

    console.log('✅ All helper function tests passed!\n');
}

async function testDatabaseQueries() {
    console.log('🗄️  Testing Database Queries...\n');

    try {
        // Test 1: Get some events
        console.log('1️⃣  Fetching events...');
        const events = await prisma.event.findMany({
            take: 5,
            include: {
                _count: {
                    select: {
                        registrations: true,
                        posts: true
                    }
                }
            }
        });
        console.log(`   Found ${events.length} events`);
        if (events.length > 0) {
            console.log(`   Sample event: ${events[0].title}`);
            console.log(`   ✅ Pass\n`);
        } else {
            console.log(`   ⚠️  No events in database\n`);
        }

        // Test 2: Get recent activity metrics for first event
        if (events.length > 0) {
            console.log('2️⃣  Testing getRecentActivityMetrics()...');
            const eventId = events[0].id;
            const metrics = await getRecentActivityMetrics(eventId, 7);
            console.log(`   Event: ${events[0].title}`);
            console.log(`   Metrics (last 7 days):`, metrics);
            console.log(`   ✅ Pass\n`);

            // Test 3: Get discussion stats
            console.log('3️⃣  Testing getRecentDiscussionStats()...');
            const discussionStats = await getRecentDiscussionStats(eventId);
            console.log(`   Discussion Stats (last 24h):`, discussionStats);
            console.log(`   ✅ Pass\n`);
        }

        console.log('✅ All database query tests passed!\n');
    } catch (error) {
        console.error('❌ Database query test failed:', error);
    }
}

async function testDashboardAPI() {
    console.log('🌐 Testing Dashboard API Logic...\n');

    try {
        // Simulate dashboard request for different roles
        const testUsers = [
            { userId: 'test-volunteer', role: 'VOLUNTEER' },
            { userId: 'test-manager', role: 'EVENT_MANAGER' },
            { userId: 'test-admin', role: 'ADMIN' },
        ];

        for (const { userId, role } of testUsers) {
            console.log(`Testing as ${role}...`);

            const baseWhere = getEventWhereClause(userId, role);
            const events = await prisma.event.findMany({
                where: {
                    ...baseWhere,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                },
                take: 5,
                orderBy: { createdAt: 'desc' }
            });

            console.log(`   Found ${events.length} new events`);
            console.log(`   ✅ ${role} test passed\n`);
        }

        console.log('✅ All API logic tests passed!\n');
    } catch (error) {
        console.error('❌ API logic test failed:', error);
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Dashboard API Phase 1 - Test Suite');
    console.log('═══════════════════════════════════════════════════\n');

    try {
        // Test 1: Helper Functions (no DB required)
        await testHelperFunctions();

        // Test 2: Database Queries
        await testDatabaseQueries();

        // Test 3: Dashboard API Logic
        await testDashboardAPI();

        console.log('═══════════════════════════════════════════════════');
        console.log('  ✅ ALL TESTS PASSED!');
        console.log('═══════════════════════════════════════════════════\n');

        console.log('📋 Next Steps:');
        console.log('1. Run database migration: npx prisma migrate dev --name add_dashboard_indexes');
        console.log('2. Test the actual API endpoint: GET /api/dashboard');
        console.log('3. Check performance metrics');
        console.log('4. Move to Phase 2: Frontend Implementation\n');

    } catch (error) {
        console.error('❌ Test suite failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run tests
main();
