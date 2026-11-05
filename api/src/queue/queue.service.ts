import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisitStatus } from '@prisma/client';

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}

  async getWaitingQueue(params?: { doctorId?: string; search?: string }) {
    const where: any = {
      status: VisitStatus.WAITING,
    };

    if (params?.doctorId) {
      where.doctorId = params.doctorId;
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { visitNumber: { contains: q, mode: 'insensitive' } },
        { patient: { fullName: { contains: q, mode: 'insensitive' } } },
        { patient: { mobileNumber: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.patientVisit.findMany({
      where,
      orderBy: { queueNumber: 'asc' },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
        consultation: true,
        registeredBy: { select: { name: true } },
      },
    });
  }

  async getConsultedQueue(params?: { doctorId?: string; search?: string }) {
    const where: any = {
      status: VisitStatus.CONSULTED,
    };

    if (params?.doctorId) {
      where.doctorId = params.doctorId;
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { visitNumber: { contains: q, mode: 'insensitive' } },
        { patient: { fullName: { contains: q, mode: 'insensitive' } } },
        { patient: { mobileNumber: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.patientVisit.findMany({
      where,
      orderBy: { consultedAt: 'desc' },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
        consultation: true,
        consultedBy: { select: { name: true } },
      },
    });
  }

  async getCompletedQueue(params?: { doctorId?: string; search?: string }) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const where: any = {
      status: VisitStatus.COMPLETED,
      completedAt: { gte: startOfToday },
    };

    if (params?.doctorId) {
      where.doctorId = params.doctorId;
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { visitNumber: { contains: q, mode: 'insensitive' } },
        { patient: { fullName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.patientVisit.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
        consultation: true,
        payments: true,
      },
    });
  }

  async getReceptionistStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayRegistered, waitingCount, consultedCount, completedToday] = await Promise.all([
      this.prisma.patientVisit.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.patientVisit.count({
        where: { status: VisitStatus.WAITING },
      }),
      this.prisma.patientVisit.count({
        where: { status: VisitStatus.CONSULTED },
      }),
      this.prisma.patientVisit.count({
        where: {
          status: VisitStatus.COMPLETED,
          completedAt: { gte: startOfToday },
        },
      }),
    ]);

    return {
      todayRegistered,
      waitingCount,
      consultedCount,
      completedToday,
    };
  }

  async getDoctorStats(doctorId?: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const baseWhere: any = {};
    if (doctorId) {
      baseWhere.doctorId = doctorId;
    }

    const [waitingCount, consultedCount, todayTotal] = await Promise.all([
      this.prisma.patientVisit.count({
        where: { ...baseWhere, status: VisitStatus.WAITING },
      }),
      this.prisma.patientVisit.count({
        where: { ...baseWhere, status: VisitStatus.CONSULTED },
      }),
      this.prisma.patientVisit.count({
        where: { ...baseWhere, createdAt: { gte: startOfToday } },
      }),
    ]);

    return {
      waitingCount,
      consultedCount,
      todayTotal,
    };
  }
}

