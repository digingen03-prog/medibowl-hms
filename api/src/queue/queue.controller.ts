import { Controller, Get, Query } from '@nestjs/common';
import { QueueService } from './queue.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('waiting')
  @Roles(Role.RECEPTIONIST, Role.DOCTOR, Role.DOCTOR_ASSISTANT, Role.ADMIN)
  async getWaiting(
    @Query('doctorId') doctorId?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: any,
  ) {
    // If the caller is a Doctor and no doctorId was explicitly passed, filter by their doctor profile
    const targetDoctorId = doctorId || (user?.role === Role.DOCTOR ? user.doctorId : undefined);
    return this.queueService.getWaitingQueue({ doctorId: targetDoctorId, search });
  }

  @Get('consulted')
  @Roles(Role.RECEPTIONIST, Role.DOCTOR, Role.DOCTOR_ASSISTANT, Role.ADMIN)
  async getConsulted(
    @Query('doctorId') doctorId?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: any,
  ) {
    const targetDoctorId = doctorId || (user?.role === Role.DOCTOR ? user.doctorId : undefined);
    return this.queueService.getConsultedQueue({ doctorId: targetDoctorId, search });
  }

  @Get('completed')
  @Roles(Role.RECEPTIONIST, Role.DOCTOR, Role.DOCTOR_ASSISTANT, Role.ADMIN)
  async getCompleted(
    @Query('doctorId') doctorId?: string,
    @Query('search') search?: string,
  ) {
    return this.queueService.getCompletedQueue({ doctorId, search });
  }

  @Get('stats/receptionist')
  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  async getReceptionistStats() {
    return this.queueService.getReceptionistStats();
  }

  @Get('stats/doctor')
  @Roles(Role.DOCTOR, Role.ADMIN)
  async getDoctorStats(@CurrentUser() user: any, @Query('doctorId') queryDoctorId?: string) {
    const doctorId = queryDoctorId || (user.role === Role.DOCTOR ? user.doctorId : undefined);
    return this.queueService.getDoctorStats(doctorId);
  }
}

