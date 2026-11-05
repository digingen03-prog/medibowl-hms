import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisitStatus, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Doctor marks a waiting visit as CONSULTED atomically.
   */
  async markAsConsulted(visitId: string, doctorUserId: string) {
    const doctorUser = await this.prisma.user.findUnique({
      where: { id: doctorUserId },
      include: { doctorProfile: true },
    });

    if (!doctorUser || (doctorUser.role !== Role.DOCTOR && doctorUser.role !== Role.ADMIN)) {
      throw new BadRequestException('Only a doctor or administrator can mark a patient as consulted');
    }

    const doctorProfileId = doctorUser.doctorProfile?.id;

    // Atomic update with conditional status check to prevent race condition
    const updatedVisit = await this.prisma.$transaction(async (tx) => {
      const visit = await tx.patientVisit.findUnique({
        where: { id: visitId },
        include: { doctor: true },
      });

      if (!visit) {
        throw new NotFoundException(`Visit with ID ${visitId} not found`);
      }

      if (visit.status !== VisitStatus.WAITING) {
        throw new ConflictException(
          `Visit cannot be consulted because its current status is '${visit.status}' (already consulted or completed)`,
        );
      }

      // Execute update
      const now = new Date();
      const updated = await tx.patientVisit.update({
        where: { id: visitId },
        data: {
          status: VisitStatus.CONSULTED,
          consultedById: doctorUser.id,
          consultedAt: now,
          // If doctorId is being updated to the consulting doctor if not already assigned
          ...(doctorProfileId ? { doctorId: doctorProfileId } : {}),
        },
        include: {
          patient: true,
          doctor: {
            include: {
              user: { select: { name: true } },
            },
          },
          consultation: true,
        },
      });

      // Update or create Consultation record if needed
      if (updated.consultation) {
        if (doctorProfileId && updated.consultation.doctorId !== doctorProfileId) {
          await tx.consultation.update({
            where: { id: updated.consultation.id },
            data: {
              doctorId: doctorProfileId,
            },
          });
        }
      } else {
        await tx.consultation.create({
          data: {
            visitId: updated.id,
            doctorId: doctorProfileId || updated.doctorId,
            consultationFee: updated.doctor?.defaultConsultationFee || 500.00,
          },
        });
      }

      return updated;
    });

    await this.auditService.log({
      userId: doctorUserId,
      action: 'PATIENT_MARKED_CONSULTED',
      entityType: 'PatientVisit',
      entityId: visitId,
      previousValues: { status: VisitStatus.WAITING },
      newValues: {
        status: VisitStatus.CONSULTED,
        consultedById: doctorUser.id,
        consultedAt: updatedVisit.consultedAt,
      },
    });

    return updatedVisit;
  }
}

