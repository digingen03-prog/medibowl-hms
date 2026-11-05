import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    visitId?: string;
    method?: PaymentMethod;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params?.limit || 20)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.visitId) where.visitId = params.visitId;
    if (params?.method) where.paymentMethod = params.method;

    if (params?.startDate || params?.endDate) {
      where.collectedAt = {};
      if (params.startDate) where.collectedAt.gte = new Date(params.startDate);
      if (params.endDate) where.collectedAt.lte = new Date(params.endDate);
    }

    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { collectedAt: 'desc' },
        include: {
          visit: {
            include: {
              patient: true,
              doctor: {
                include: { user: { select: { name: true } } },
              },
            },
          },
          collectedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        visit: {
          include: {
            patient: true,
            doctor: {
              include: { user: { select: { name: true } } },
            },
          },
        },
        collectedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }
}

