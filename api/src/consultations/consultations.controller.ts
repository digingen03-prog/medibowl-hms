import { Controller, Post, Param } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post('visits/:id/consulted')
  @Roles(Role.DOCTOR, Role.ADMIN)
  async markAsConsultedFromVisits(
    @Param('id') visitId: string,
    @CurrentUser('id') doctorUserId: string,
  ) {
    return this.consultationsService.markAsConsulted(visitId, doctorUserId);
  }

  @Post('consultations/:id/consulted')
  @Roles(Role.DOCTOR, Role.ADMIN)
  async markAsConsulted(
    @Param('id') visitId: string,
    @CurrentUser('id') doctorUserId: string,
  ) {
    return this.consultationsService.markAsConsulted(visitId, doctorUserId);
  }
}

