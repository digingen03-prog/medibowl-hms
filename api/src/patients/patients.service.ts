import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/create-patient.dto';
import { SequenceService } from '../common/services/sequence.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreatePatientDto, userId?: string) {
    const patientNumber = await this.sequenceService.getNextPatientNumber();

    const patient = await this.prisma.patient.create({
      data: {
        patientNumber,
        fullName: dto.fullName.trim(),
        age: Number(dto.age),
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender,
        mobileNumber: dto.mobileNumber.trim(),
        address: dto.address?.trim() || null,
        emergencyContact: dto.emergencyContact?.trim() || null,
        remarks: dto.remarks?.trim() || null,
      },
    });

    await this.auditService.log({
      userId,
      action: 'PATIENT_REGISTERED',
      entityType: 'Patient',
      entityId: patient.id,
      newValues: {
        patientNumber: patient.patientNumber,
        fullName: patient.fullName,
        mobileNumber: patient.mobileNumber,
      },
    });

    return patient;
  }

  async search(query: string) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    return this.prisma.patient.findMany({
      where: {
        OR: [
          { mobileNumber: { contains: cleanQuery, mode: 'insensitive' } },
          { fullName: { contains: cleanQuery, mode: 'insensitive' } },
          { patientNumber: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkDuplicateWarning(mobileNumber: string) {
    const existing = await this.prisma.patient.findMany({
      where: {
        mobileNumber: mobileNumber.trim(),
      },
      select: {
        id: true,
        patientNumber: true,
        fullName: true,
        age: true,
        gender: true,
        mobileNumber: true,
        createdAt: true,
      },
    });

    return {
      hasExisting: existing.length > 0,
      existingCount: existing.length,
      patients: existing,
    };
  }

  async findAll(params?: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params?.limit || 20)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { mobileNumber: { contains: q, mode: 'insensitive' } },
        { patientNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, patients] = await Promise.all([
      this.prisma.patient.count({ where }),
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { visits: true },
          },
        },
      }),
    ]);

    return {
      data: patients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        visits: {
          include: {
            doctor: {
              include: {
                user: { select: { name: true } },
              },
            },
            consultation: true,
            payments: {
              include: {
                collectedBy: { select: { name: true } },
              },
            },
            registeredBy: { select: { name: true } },
            consultedBy: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto, userId?: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    const updated = await this.prisma.patient.update({
      where: { id },
      data: {
        fullName: dto.fullName !== undefined ? dto.fullName.trim() : patient.fullName,
        age: dto.age !== undefined ? Number(dto.age) : patient.age,
        gender: dto.gender !== undefined ? dto.gender : patient.gender,
        mobileNumber: dto.mobileNumber !== undefined ? dto.mobileNumber.trim() : patient.mobileNumber,
        dateOfBirth: dto.dateOfBirth !== undefined ? (dto.dateOfBirth ? new Date(dto.dateOfBirth) : null) : patient.dateOfBirth,
        address: dto.address !== undefined ? dto.address?.trim() || null : patient.address,
        emergencyContact: dto.emergencyContact !== undefined ? dto.emergencyContact?.trim() || null : patient.emergencyContact,
        remarks: dto.remarks !== undefined ? dto.remarks?.trim() || null : patient.remarks,
      },
    });

    await this.auditService.log({
      userId,
      action: 'PATIENT_UPDATED',
      entityType: 'Patient',
      entityId: id,
      previousValues: patient,
      newValues: dto,
    });

    return updated;
  }
}

