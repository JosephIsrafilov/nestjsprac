import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Admin User',
      passwordHash,
      role: UserRole.admin,
    },
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: UserRole.admin,
    },
  });

  console.log('Done! Login with admin@example.com / admin123');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
