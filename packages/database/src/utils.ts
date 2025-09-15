import { prisma } from './client';
import { SkillCategory, SkillLevel, UserRole } from '@connectgig/types';

// Database seeding utilities
export async function seedSkills() {
  const skills = [
    { name: 'Plumbing', category: SkillCategory.PLUMBING },
    { name: 'Electrical Work', category: SkillCategory.ELECTRICAL },
    { name: 'Carpentry', category: SkillCategory.CARPENTRY },
    { name: 'House Cleaning', category: SkillCategory.CLEANING },
    { name: 'Tutoring', category: SkillCategory.TUTORING },
    { name: 'Food Delivery', category: SkillCategory.DELIVERY },
    { name: 'General Repairs', category: SkillCategory.OTHER },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  console.log('✅ Skills seeded successfully');
}

export async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@connectgig.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // In production, you should hash the password properly
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin User',
      email: adminEmail,
      phone: '+1234567890',
      passwordHash: adminPassword, // In production, hash this
      role: UserRole.ADMIN,
      kycVerified: true,
    },
  });

  console.log('✅ Admin user seeded successfully:', adminUser.email);
  return adminUser;
}

// Database health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Clean database (for testing)
export async function cleanDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clean database in production');
  }

  const tables = [
    'notifications',
    'chats',
    'payments',
    'reviews',
    'job_locations',
    'jobs',
    'documents',
    'worker_locations',
    'worker_skills',
    'workers',
    'skills',
    'users',
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }

  console.log('✅ Database cleaned successfully');
}

// Reset database (for testing)
export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production');
  }

  await cleanDatabase();
  await seedSkills();
  await seedAdminUser();

  console.log('✅ Database reset and seeded successfully');
}

// Database statistics
export async function getDatabaseStats() {
  const [
    userCount,
    workerCount,
    jobCount,
    skillCount,
    reviewCount,
    paymentCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.worker.count(),
    prisma.job.count(),
    prisma.skill.count(),
    prisma.review.count(),
    prisma.payment.count(),
  ]);

  return {
    users: userCount,
    workers: workerCount,
    jobs: jobCount,
    skills: skillCount,
    reviews: reviewCount,
    payments: paymentCount,
  };
}

// Export all utilities
export const dbUtils = {
  seedSkills,
  seedAdminUser,
  checkDatabaseConnection,
  cleanDatabase,
  resetDatabase,
  getDatabaseStats,
};
