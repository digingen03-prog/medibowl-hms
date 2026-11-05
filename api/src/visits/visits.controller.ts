import { Controller, Get, Post, Param, Body, Query, Patch } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, VisitStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  async create(@Body() dto: CreateVisitDto, @CurrentUser('id') userId: string) {
    return this.visitsService.createVisit(dto, userId);
  }

  @Get()
  @Roles(Role.RECEPTIONIST, Role.ADMIN, Role.DOCTOR, Role.DOCTOR_ASSISTANT)
  async findAll(
    @Query('status') status?: VisitStatus,
    @Query('doctorId') doctorId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('date') date?: string,
  ) {
    return this.visitsService.findAll({
      status,
      doctorId,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      date,
    });
  }

  @Get(':id')
  @Roles(Role.RECEPTIONIST, Role.ADMIN, Role.DOCTOR, Role.DOCTOR_ASSISTANT)
  async findOne(@Param('id') id: string) {
    return this.visitsService.findOne(id);
  }

  @Patch(':id/cancel')
  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.visitsService.cancelVisit(id, reason, userId);
  }
}

