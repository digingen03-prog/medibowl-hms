import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SequenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a concurrency-safe unique Patient Number, e.g. PAT-2026-00001
   */
  async getNextPatientNumber(year: number = new Date().getFullYear()): Promise<string> {
    const sequenceKey = `PAT_${year}`;

    const seq = await this.prisma.$transaction(async (tx) => {
      const existingSeq = await tx.systemSequence.findUnique({
        where: { sequenceName: sequenceKey },
      });

      if (!existingSeq) {
        const lastPatient = await tx.patient.findFirst({
          where: { patientNumber: { startsWith: `PAT-${year}-` } },
          orderBy: { patientNumber: 'desc' },
        });

        let initialVal = 0;
        if (lastPatient) {
          const parts = lastPatient.patientNumber.split('-');
          initialVal = parseInt(parts[parts.length - 1], 10) || 0;
        }

        const nextVal = initialVal + 1;
        await tx.systemSequence.create({
          data: {
            sequenceName: sequenceKey,
            lastValue: nextVal,
          },
        });
        return nextVal;
      }

      const updated = await tx.systemSequence.update({
        where: { sequenceName: sequenceKey },
        data: { lastValue: { increment: 1 } },
      });

      return updated.lastValue;
    });

    return `PAT-${year}-${String(seq).padStart(5, '0')}`;
  }

  /**
   * Generates a concurrency-safe unique Visit Number, e.g. VIS-2026-00001
   */
  async getNextVisitNumber(year: number = new Date().getFullYear()): Promise<string> {
    const sequenceKey = `VIS_${year}`;

    const seq = await this.prisma.$transaction(async (tx) => {
      const existingSeq = await tx.systemSequence.findUnique({
        where: { sequenceName: sequenceKey },
      });

      if (!existingSeq) {
        const lastVisit = await tx.patientVisit.findFirst({
          where: { visitNumber: { startsWith: `VIS-${year}-` } },
          orderBy: { visitNumber: 'desc' },
        });

        let initialVal = 0;
        if (lastVisit) {
          const parts = lastVisit.visitNumber.split('-');
          initialVal = parseInt(parts[parts.length - 1], 10) || 0;
        }

        const nextVal = initialVal + 1;
        await tx.systemSequence.create({
          data: {
            sequenceName: sequenceKey,
            lastValue: nextVal,
          },
        });
        return nextVal;
      }

      const updated = await tx.systemSequence.update({
        where: { sequenceName: sequenceKey },
        data: { lastValue: { increment: 1 } },
      });

      return updated.lastValue;
    });

    return `VIS-${year}-${String(seq).padStart(5, '0')}`;
  }

  /**
   * Generates daily queue number (1, 2, 3...) reset every calendar day
   */
  async getNextDailyQueueNumber(date: Date = new Date()): Promise<number> {
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.dailyQueueSequence.findUnique({
        where: { dateKey },
      });

      if (!existing) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const lastVisit = await tx.patientVisit.findFirst({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          orderBy: { queueNumber: 'desc' },
        });

        const initialVal = lastVisit ? lastVisit.queueNumber : 0;
        const nextVal = initialVal + 1;

        await tx.dailyQueueSequence.create({
          data: { dateKey, lastQueue: nextVal },
        });
        return nextVal;
      }

      const updated = await tx.dailyQueueSequence.update({
        where: { dateKey },
        data: { lastQueue: { increment: 1 } },
      });

      return updated.lastQueue;
    });
  }
}
