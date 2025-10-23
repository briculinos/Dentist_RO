import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: 'demo-clinic-id' },
    update: {},
    create: {
      id: 'demo-clinic-id',
      name: 'Clinica Demo Stomatologică',
      address: 'Str. Exemplu Nr. 123, București',
      phone: '0212345678',
      email: 'contact@clinica-demo.ro',
      dataControllerName: 'Dr. Ion Popescu',
      dataControllerContact: 'gdpr@clinica-demo.ro',
    },
  });

  console.log('✅ Created demo clinic:', clinic.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clinica.ro' },
    update: {},
    create: {
      email: 'admin@clinica.ro',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'Utilizator',
      role: 'ADMIN',
      clinicId: clinic.id,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create doctor user
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@clinica.ro' },
    update: {},
    create: {
      email: 'doctor@clinica.ro',
      passwordHash: hashedPassword,
      firstName: 'Ion',
      lastName: 'Popescu',
      role: 'DOCTOR',
      clinicId: clinic.id,
    },
  });

  console.log('✅ Created doctor user:', doctorUser.email);

  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Admin:  admin@clinica.ro / admin123');
  console.log('   Doctor: doctor@clinica.ro / admin123');
  console.log('');
  console.log('⚠️  IMPORTANT: Change these passwords in production!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
