import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@kreels.com' },
    update: {},
    create: {
      email: 'demo@kreels.com',
      username: 'demouser',
      displayName: 'Demo User',
      password: hashedPassword,
      userType: 'INDIVIDUAL',
      isActive: true,
      invitationCode: 'DEMO01',
      wallet: {
        create: {
          balance: 1000,
        },
      },
    },
    include: {
      wallet: true,
    },
  });

  console.log('Created demo user:', demoUser.email);

  // Create a professional/creator demo user
  const creatorUser = await prisma.user.upsert({
    where: { email: 'creator@kreels.com' },
    update: {},
    create: {
      email: 'creator@kreels.com',
      username: 'democreator',
      displayName: 'Demo Creator',
      password: hashedPassword,
      userType: 'PROFESSIONAL',
      isActive: true,
      bio: 'Professional content creator on Kreels',
      invitationCode: 'CREATE01',
      wallet: {
        create: {
          balance: 5000,
        },
      },
    },
    include: {
      wallet: true,
    },
  });

  console.log('Created creator user:', creatorUser.email);

  console.log('Database seeded successfully!');
  console.log('\nDemo accounts:');
  console.log('  Email: demo@kreels.com / Password: demo123');
  console.log('  Email: creator@kreels.com / Password: demo123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
