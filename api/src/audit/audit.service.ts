import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValues?: any;
  newValues?: any;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: CreateAuditLogParams) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          previousValues: params.previousValues ? JSON.parse(JSON.stringify(params.previousValues)) : undefined,
          newValues: params.newValues ? JSON.parse(JSON.stringify(params.newValues)) : undefined,
          ipAddress: params.ipAddress,
        },
      });
    } catch (error) {
      // Non-blocking log catch to prevent cascading failures
      console.error('AuditLog creation failed:', error);
      return null;
    }
  }

  async getLogsForEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

