import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DoctorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(onlyActive: boolean = true) {
    return this.prisma.doctor.findMany({
      where: onlyActive ? { isActive: true, user: { isActive: true } } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            isActive: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  async findByUserId(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found for current user');
    }

    return doctor;
  }

  async update(id: string, dto: UpdateDoctorDto, adminId?: string) {
    const doctor = await this.findOne(id);

    const updated = await this.prisma.doctor.update({
      where: { id },
      data: {
        specialization: dto.specialization !== undefined ? dto.specialization : doctor.specialization,
        defaultConsultationFee: dto.defaultConsultationFee !== undefined ? dto.defaultConsultationFee : doctor.defaultConsultationFee,
        isActive: dto.isActive !== undefined ? dto.isActive : doctor.isActive,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'DOCTOR_PROFILE_UPDATED',
      entityType: 'Doctor',
      entityId: id,
      previousValues: {
        specialization: doctor.specialization,
        defaultConsultationFee: doctor.defaultConsultationFee,
        isActive: doctor.isActive,
      },
      newValues: dto,
    });

    return updated;
  }
}

