import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisitStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      todayRegistrations,
      waitingPatients,
      consultedPatients,
      completedVisits,
      paymentsToday,
      allVisitsWithConsultationAndPayments,
    ] = await Promise.all([
      this.prisma.patient.count(),
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
        where: { status: VisitStatus.COMPLETED },
      }),
      this.prisma.payment.findMany({
        where: { collectedAt: { gte: startOfToday } },
        select: { amountReceived: true },
      }),
      this.prisma.patientVisit.findMany({
        where: {
          status: { in: [VisitStatus.WAITING, VisitStatus.CONSULTED] },
        },
        include: {
          consultation: true,
          payments: true,
        },
      }),
    ]);

    const totalFeesCollectedToday = paymentsToday.reduce(
      (acc, p) => acc + Number(p.amountReceived),
      0,
    );

    // Calculate outstanding pending fees
    let outstandingAmount = 0;
    for (const v of allVisitsWithConsultationAndPayments) {
      const fee = v.consultation ? Number(v.consultation.consultationFee) : 0;
      const paid = v.payments.reduce((acc, p) => acc + Number(p.amountReceived), 0);
      outstandingAmount += Math.max(0, fee - paid);
    }

    return {
      totalPatients,
      todayRegistrations,
      waitingPatients,
      consultedPatients,
      completedVisits,
      totalFeesCollectedToday,
      outstandingAmount,
    };
  }
}

