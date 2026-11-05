import { PrismaClient, Role, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial HMS data...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@hospital.com',
      username: 'admin',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // 2. Receptionist
  const receptionist = await prisma.user.upsert({
    where: { email: 'receptionist@hospital.com' },
    update: {},
    create: {
      name: 'Priya Sharma (Receptionist)',
      email: 'receptionist@hospital.com',
      username: 'receptionist',
      passwordHash,
      role: Role.RECEPTIONIST,
      isActive: true,
    },
  });

  // 3. Doctor 1
  const doctorUser1 = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Jenkins',
      email: 'doctor@hospital.com',
      username: 'doctor',
      passwordHash,
      role: Role.DOCTOR,
      isActive: true,
    },
  });

  const doctor1 = await prisma.doctor.upsert({
    where: { userId: doctorUser1.id },
    update: {},
    create: {
      userId: doctorUser1.id,
      specialization: 'General Physician & Cardiologist',
      defaultConsultationFee: 500.00,
      isActive: true,
    },
  });

  // 4. Doctor 2
  const doctorUser2 = await prisma.user.upsert({
    where: { email: 'doctor2@hospital.com' },
    update: {},
    create: {
      name: 'Dr. Robert Chen',
      email: 'doctor2@hospital.com',
      username: 'doctor2',
      passwordHash,
      role: Role.DOCTOR,
      isActive: true,
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctorUser2.id },
    update: {},
    create: {
      userId: doctorUser2.id,
      specialization: 'Orthopedics & Sports Medicine',
      defaultConsultationFee: 750.00,
      isActive: true,
    },
  });

  // 5. Doctor Assistant
  const assistant = await prisma.user.upsert({
    where: { email: 'assistant@hospital.com' },
    update: {},
    create: {
      name: 'Anjali Verma (Doctor Assistant)',
      email: 'assistant@hospital.com',
      username: 'assistant',
      passwordHash,
      role: Role.DOCTOR_ASSISTANT,
      isActive: true,
    },
  });

  // Seed sample patient for immediate testing readiness if needed
  const samplePatient = await prisma.patient.upsert({
    where: { patientNumber: 'PAT-2026-00001' },
    update: {},
    create: {
      patientNumber: 'PAT-2026-00001',
      fullName: 'Vikram Mehta',
      age: 42,
      gender: Gender.MALE,
      mobileNumber: '9876543210',
      address: '42 Lotus Enclave, MG Road, Bangalore',
      emergencyContact: 'Sunita Mehta (Wife) - 9876543211',
      remarks: 'Mild hypertension history',
    },
  });

  console.log('Seeding completed successfully!');
  console.log({
    admin: admin.email,
    receptionist: receptionist.email,
    doctor1: doctorUser1.email,
    doctor2: doctorUser2.email,
    assistant: assistant.email,
    samplePatient: samplePatient.patientNumber,
  });
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

