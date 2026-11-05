import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinishVisitDto } from './dto/finish-visit.dto';
import { VisitStatus, PaymentStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssistantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getDashboardStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Total consulted patients waiting for fee collection
    const consultedVisits = await this.prisma.patientVisit.findMany({
      where: { status: VisitStatus.CONSULTED },
      include: {
        consultation: true,
        payments: true,
      },
    });

    const totalConsulted = consultedVisits.length;

    // Fees pending calculation
    let feesPending = 0;
    for (const v of consultedVisits) {
      const fee = v.consultation ? Number(v.consultation.consultationFee) : 0;
      const paid = v.payments.reduce((acc, p) => acc + Number(p.amountReceived), 0);
      const pending = Math.max(0, fee - paid);
      feesPending += pending;
    }

    // 2. Fees collected today
    const paymentsToday = await this.prisma.payment.findMany({
      where: {
        collectedAt: { gte: startOfToday },
      },
    });

    const feesCollectedToday = paymentsToday.reduce(
      (acc, p) => acc + Number(p.amountReceived),
      0,
    );

    // 3. Completed visits today
    const completedVisitsToday = await this.prisma.patientVisit.count({
      where: {
        status: VisitStatus.COMPLETED,
        completedAt: { gte: startOfToday },
      },
    });

    return {
      totalConsulted,
      feesPending,
      feesCollectedToday,
      completedVisitsToday,
    };
  }

  async getConsultedPatients(search?: string) {
    const where: any = {
      status: VisitStatus.CONSULTED,
    };

    if (search) {
      const q = search.trim();
      where.OR = [
        { visitNumber: { contains: q, mode: 'insensitive' } },
        { patient: { fullName: { contains: q, mode: 'insensitive' } } },
        { patient: { mobileNumber: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const visits = await this.prisma.patientVisit.findMany({
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
        payments: true,
      },
    });

    return visits.map((v) => {
      const fee = v.consultation ? Number(v.consultation.consultationFee) : 0;
      const totalPaid = v.payments.reduce((acc, p) => acc + Number(p.amountReceived), 0);
      const balance = Math.max(0, fee - totalPaid);

      return {
        ...v,
        totalFee: fee,
        totalPaid,
        balance,
      };
    });
  }

  async getVisitDetails(visitId: string) {
    const visit = await this.prisma.patientVisit.findUnique({
      where: { id: visitId },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        consultation: {
          include: {
            assistant: { select: { id: true, name: true } },
          },
        },
        payments: {
          include: {
            collectedBy: { select: { id: true, name: true } },
          },
          orderBy: { collectedAt: 'desc' },
        },
        registeredBy: { select: { id: true, name: true } },
        consultedBy: { select: { id: true, name: true } },
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    const fee = visit.consultation ? Number(visit.consultation.consultationFee) : 0;
    const totalPaid = visit.payments.reduce((acc, p) => acc + Number(p.amountReceived), 0);
    const balance = Math.max(0, fee - totalPaid);

    return {
      ...visit,
      totalFee: fee,
      totalPaid,
      balance,
    };
  }

  /**
   * SAVE & FINISH workflow:
   * Saves consultation fee, creates payment record, checks full vs partial payment,
   * updates visit status to COMPLETED if fully paid, writes audit logs.
   */
  async finishVisit(visitId: string, dto: FinishVisitDto, assistantUserId: string) {
    const visit = await this.prisma.patientVisit.findUnique({
      where: { id: visitId },
      include: {
        consultation: true,
        payments: true,
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    if (visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException('This visit has already been completed.');
    }

    if (visit.status !== VisitStatus.CONSULTED) {
      throw new BadRequestException(`Cannot finish visit in '${visit.status}' status. Visit must be marked CONSULTED by the doctor first.`);
    }

    const targetFee = Number(dto.consultationFee);
    const receivedNow = Number(dto.amountReceived);

    const previousPaymentsSum = visit.payments.reduce((acc, p) => acc + Number(p.amountReceived), 0);
    const cumulativePaid = previousPaymentsSum + receivedNow;
    const isFullyPaid = cumulativePaid >= targetFee;

    const paymentStatus = isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID;
    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Ensure/update consultation
      let consultation = visit.consultation;
      if (!consultation) {
        consultation = await tx.consultation.create({
          data: {
            visitId,
            doctorId: visit.doctorId,
            assistantId: assistantUserId,
            consultationFee: new Prisma.Decimal(targetFee),
          },
        });
      } else {
        consultation = await tx.consultation.update({
          where: { id: consultation.id },
          data: {
            consultationFee: new Prisma.Decimal(targetFee),
            assistantId: assistantUserId,
          },
        });
      }

      // 2. Create payment record if receivedNow > 0 OR if it's a 0-fee consultation
      let paymentRecord = null;
      if (receivedNow > 0 || (targetFee === 0 && previousPaymentsSum === 0)) {
        paymentRecord = await tx.payment.create({
          data: {
            visitId,
            consultationId: consultation.id,
            amountReceived: new Prisma.Decimal(receivedNow),
            paymentMethod: dto.paymentMethod,
            paymentStatus,
            transactionReference: dto.transactionReference?.trim() || null,
            collectedById: assistantUserId,
            collectedAt: now,
          },
        });
      }

      // 3. Mark visit COMPLETED if fully paid
      let updatedVisit = visit;
      if (isFullyPaid) {
        updatedVisit = await tx.patientVisit.update({
          where: { id: visitId },
          data: {
            status: VisitStatus.COMPLETED,
            completedAt: now,
          },
          include: {
            consultation: true,
            payments: true,
          },
        });
      }

      return {
        updatedVisit,
        consultation,
        paymentRecord,
        isFullyPaid,
        outstandingBalance: Math.max(0, targetFee - cumulativePaid),
      };
    });

    await this.auditService.log({
      userId: assistantUserId,
      action: result.isFullyPaid ? 'VISIT_COMPLETED' : 'PARTIAL_PAYMENT_COLLECTED',
      entityType: 'PatientVisit',
      entityId: visitId,
      newValues: {
        consultationFee: targetFee,
        amountReceived: receivedNow,
        paymentMethod: dto.paymentMethod,
        isFullyPaid: result.isFullyPaid,
        outstandingBalance: result.outstandingBalance,
      },
    });

    return {
      success: true,
      isFullyPaid: result.isFullyPaid,
      outstandingBalance: result.outstandingBalance,
      message: result.isFullyPaid
        ? 'Fee collection recorded and visit completed successfully!'
        : `Partial payment recorded. Outstanding balance: ₹${result.outstandingBalance.toFixed(2)}`,
      data: await this.getVisitDetails(visitId),
    };
  }
}

