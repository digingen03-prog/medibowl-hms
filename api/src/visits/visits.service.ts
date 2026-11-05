import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { SequenceService } from '../common/services/sequence.service';
import { AuditService } from '../audit/audit.service';
import { VisitStatus } from '@prisma/client';

@Injectable()
export class VisitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
    private readonly auditService: AuditService,
  ) {}

  async createVisit(dto: CreateVisitDto, userId: string) {
    if (!dto.patientId && !dto.newPatient) {
      throw new BadRequestException('Either an existing patientId or newPatient details must be provided');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
      include: { user: true },
    });

    if (!doctor || !doctor.isActive || !doctor.user.isActive) {
      throw new BadRequestException('The selected doctor is inactive or invalid');
    }

    const visit = await this.prisma.$transaction(async (tx) => {
      let resolvedPatientId = dto.patientId;

      if (!resolvedPatientId && dto.newPatient) {
        const patientNumber = await this.sequenceService.getNextPatientNumber();
        const createdPatient = await tx.patient.create({
          data: {
            patientNumber,
            fullName: dto.newPatient.fullName.trim(),
            age: Number(dto.newPatient.age),
            gender: dto.newPatient.gender,
            mobileNumber: dto.newPatient.mobileNumber.trim(),
            dateOfBirth: dto.newPatient.dateOfBirth ? new Date(dto.newPatient.dateOfBirth) : null,
            address: dto.newPatient.address?.trim() || null,
            emergencyContact: dto.newPatient.emergencyContact?.trim() || null,
            remarks: dto.newPatient.remarks?.trim() || null,
          },
        });
        resolvedPatientId = createdPatient.id;
      }

      // Check if patient exists
      const patient = await tx.patient.findUnique({ where: { id: resolvedPatientId } });
      if (!patient) {
        throw new NotFoundException('Patient record not found');
      }

      // Concurrency-safe Visit Number and Daily Queue Number
      const visitNumber = await this.sequenceService.getNextVisitNumber();
      const queueNumber = await this.sequenceService.getNextDailyQueueNumber();

      const createdVisit = await tx.patientVisit.create({
        data: {
          visitNumber,
          patientId: resolvedPatientId!,
          doctorId: dto.doctorId,
          queueNumber,
          visitDate: new Date(),
          status: VisitStatus.WAITING,
          registeredById: userId,
        },
        include: {
          patient: true,
          doctor: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      });

      // Create linked Consultation record with the doctor's default consultation fee
      await tx.consultation.create({
        data: {
          visitId: createdVisit.id,
          doctorId: dto.doctorId,
          consultationFee: doctor.defaultConsultationFee,
        },
      });

      return createdVisit;
    });

    await this.auditService.log({
      userId,
      action: 'VISIT_CREATED',
      entityType: 'PatientVisit',
      entityId: visit.id,
      newValues: {
        visitNumber: visit.visitNumber,
        queueNumber: visit.queueNumber,
        patientId: visit.patientId,
        doctorId: visit.doctorId,
        status: visit.status,
      },
    });

    return this.findOne(visit.id);
  }

  async findAll(params?: {
    status?: VisitStatus;
    doctorId?: string;
    search?: string;
    page?: number;
    limit?: number;
    date?: string;
  }) {
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params?.limit || 20)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.doctorId) {
      where.doctorId = params.doctorId;
    }

    if (params?.date) {
      const startOfDay = new Date(params.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(params.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { visitNumber: { contains: q, mode: 'insensitive' } },
        { patient: { fullName: { contains: q, mode: 'insensitive' } } },
        { patient: { mobileNumber: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, visits] = await Promise.all([
      this.prisma.patientVisit.count({ where }),
      this.prisma.patientVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ visitDate: 'desc' }, { queueNumber: 'desc' }],
        include: {
          patient: true,
          doctor: {
            include: {
              user: { select: { name: true } },
            },
          },
          consultation: true,
          payments: true,
          registeredBy: { select: { id: true, name: true } },
          consultedBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      data: visits,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const visit = await this.prisma.patientVisit.findUnique({
      where: { id },
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
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    return visit;
  }

  async cancelVisit(id: string, reason?: string, userId?: string) {
    const visit = await this.prisma.patientVisit.findUnique({ where: { id } });
    if (!visit) throw new NotFoundException('Visit not found');

    if (visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException('Completed visits cannot be cancelled');
    }

    const updated = await this.prisma.patientVisit.update({
      where: { id },
      data: { status: VisitStatus.CANCELLED },
    });

    await this.auditService.log({
      userId,
      action: 'VISIT_CANCELLED',
      entityType: 'PatientVisit',
      entityId: id,
      previousValues: { status: visit.status },
      newValues: { status: VisitStatus.CANCELLED, reason },
    });

    return updated;
  }
}

