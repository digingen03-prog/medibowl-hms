import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisitStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyRegistrations(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const visits = await this.prisma.patientVisit.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    const dayMap = new Map<string, { count: number; completed: number }>();

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dayMap.set(key, { count: 0, completed: 0 });
    }

    visits.forEach((v) => {
      const key = v.createdAt.toISOString().split('T')[0];
      if (dayMap.has(key)) {
        const item = dayMap.get(key)!;
        item.count += 1;
        if (v.status === VisitStatus.COMPLETED) {
          item.completed += 1;
        }
      }
    });

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      registrations: data.count,
      completed: data.completed,
    }));
  }

  async getDoctorWisePatientCount() {
    const doctors = await this.prisma.doctor.findMany({
      include: {
        user: { select: { name: true } },
        visits: {
          select: {
            status: true,
          },
        },
      },
    });

    return doctors.map((d) => {
      const totalVisits = d.visits.length;
      const waiting = d.visits.filter((v) => v.status === VisitStatus.WAITING).length;
      const consulted = d.visits.filter((v) => v.status === VisitStatus.CONSULTED).length;
      const completed = d.visits.filter((v) => v.status === VisitStatus.COMPLETED).length;

      return {
        doctorId: d.id,
        doctorName: d.user.name,
        specialization: d.specialization,
        defaultFee: Number(d.defaultConsultationFee),
        totalVisits,
        waiting,
        consulted,
        completed,
      };
    });
  }

  async getDailyFeeCollection(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const payments = await this.prisma.payment.findMany({
      where: {
        collectedAt: { gte: startDate },
      },
      select: {
        collectedAt: true,
        amountReceived: true,
        paymentMethod: true,
      },
    });

    const dayMap = new Map<string, { totalAmount: number; count: number }>();

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dayMap.set(key, { totalAmount: 0, count: 0 });
    }

    payments.forEach((p) => {
      const key = p.collectedAt.toISOString().split('T')[0];
      if (dayMap.has(key)) {
        const item = dayMap.get(key)!;
        item.totalAmount += Number(p.amountReceived);
        item.count += 1;
      }
    });

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      amount: data.totalAmount,
      transactions: data.count,
    }));
  }

  async getOutstandingBalances() {
    const pendingVisits = await this.prisma.patientVisit.findMany({
      where: {
        status: { in: [VisitStatus.WAITING, VisitStatus.CONSULTED] },
      },
      include: {
        patient: true,
        doctor: {
          include: { user: { select: { name: true } } },
        },
        consultation: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pendingVisits
      .map((v) => {
        const fee = v.consultation ? Number(v.consultation.consultationFee) : 0;
        const paid = v.payments.reduce((acc, p) => acc + Number(p.amountReceived), 0);
        const outstanding = Math.max(0, fee - paid);

        return {
          visitId: v.id,
          visitNumber: v.visitNumber,
          patientName: v.patient.fullName,
          patientMobile: v.patient.mobileNumber,
          doctorName: v.doctor.user.name,
          status: v.status,
          consultationFee: fee,
          amountPaid: paid,
          outstandingBalance: outstanding,
          visitDate: v.createdAt,
        };
      })
      .filter((v) => v.outstandingBalance > 0);
  }

  async getDetailedPaymentsReport(params?: {
    search?: string;
    method?: any;
    startDate?: string;
    endDate?: string;
    doctorId?: string;
  }) {
    const where: any = {};

    if (params?.method && params.method !== 'ALL') {
      where.paymentMethod = params.method;
    }

    if (params?.startDate || params?.endDate) {
      where.collectedAt = {};
      if (params.startDate) {
        const s = new Date(params.startDate);
        s.setHours(0, 0, 0, 0);
        where.collectedAt.gte = s;
      }
      if (params.endDate) {
        const e = new Date(params.endDate);
        e.setHours(23, 59, 59, 999);
        where.collectedAt.lte = e;
      }
    }

    if (params?.doctorId && params.doctorId !== 'ALL') {
      where.visit = { doctorId: params.doctorId };
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { transactionReference: { contains: q, mode: 'insensitive' as const } },
        { visit: { visitNumber: { contains: q, mode: 'insensitive' as const } } },
        { visit: { patient: { fullName: { contains: q, mode: 'insensitive' as const } } } },
        { visit: { patient: { mobileNumber: { contains: q, mode: 'insensitive' as const } } } },
      ];
    }

    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { collectedAt: 'desc' },
      include: {
        visit: {
          include: {
            patient: true,
            doctor: {
              include: { user: { select: { name: true, email: true } } },
            },
            consultation: true,
          },
        },
        collectedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amountReceived), 0);
    const totalTransactions = payments.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const methodBreakdown = {
      CASH: 0,
      UPI: 0,
      CARD: 0,
      OTHER: 0,
    };

    payments.forEach((p) => {
      const m = p.paymentMethod as keyof typeof methodBreakdown;
      if (methodBreakdown[m] !== undefined) {
        methodBreakdown[m] += Number(p.amountReceived);
      }
    });

    return {
      summary: {
        totalRevenue,
        totalTransactions,
        averageTransaction,
        methodBreakdown,
      },
      payments: payments.map((p) => ({
        id: p.id,
        amountReceived: Number(p.amountReceived),
        paymentMethod: p.paymentMethod,
        paymentStatus: p.paymentStatus,
        transactionReference: p.transactionReference,
        collectedAt: p.collectedAt,
        visit: {
          id: p.visit.id,
          visitNumber: p.visit.visitNumber,
          queueNumber: p.visit.queueNumber,
          status: p.visit.status,
          consultationFee: p.visit.consultation ? Number(p.visit.consultation.consultationFee) : 0,
        },
        patient: {
          id: p.visit.patient.id,
          fullName: p.visit.patient.fullName,
          patientNumber: p.visit.patient.patientNumber,
          mobileNumber: p.visit.patient.mobileNumber,
          age: p.visit.patient.age,
          gender: p.visit.patient.gender,
        },
        doctor: {
          id: p.visit.doctor.id,
          name: p.visit.doctor.user.name,
          specialization: p.visit.doctor.specialization,
        },
        collectedBy: {
          id: p.collectedBy.id,
          name: p.collectedBy.name,
          email: p.collectedBy.email,
          role: p.collectedBy.role,
        },
      })),
    };
  }
}

