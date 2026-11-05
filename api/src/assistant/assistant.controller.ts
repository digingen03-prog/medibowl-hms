import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { FinishVisitDto } from './dto/finish-visit.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('assistant')
@Roles(Role.DOCTOR_ASSISTANT, Role.ADMIN)
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.assistantService.getDashboardStats();
  }

  @Get('consulted-patients')
  async getConsultedPatients(@Query('search') search?: string) {
    return this.assistantService.getConsultedPatients(search);
  }

  @Get('visits/:id')
  async getVisitDetails(@Param('id') visitId: string) {
    return this.assistantService.getVisitDetails(visitId);
  }

  @Post('visits/:id/finish')
  async finishVisit(
    @Param('id') visitId: string,
    @Body() dto: FinishVisitDto,
    @CurrentUser('id') assistantUserId: string,
  ) {
    return this.assistantService.finishVisit(visitId, dto, assistantUserId);
  }
}

