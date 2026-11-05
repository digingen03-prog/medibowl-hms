import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/create-patient.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  async create(@Body() dto: CreatePatientDto, @CurrentUser('id') userId: string) {
    return this.patientsService.create(dto, userId);
  }

  @Get('search')
  @Roles(Role.RECEPTIONIST, Role.ADMIN, Role.DOCTOR, Role.DOCTOR_ASSISTANT)
  async search(@Query('q') q: string) {
    return this.patientsService.search(q || '');
  }

  @Get('check-duplicate')
  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  async checkDuplicate(@Query('mobileNumber') mobileNumber: string) {
    return this.patientsService.checkDuplicateWarning(mobileNumber || '');
  }

  @Get()
  @Roles(Role.RECEPTIONIST, Role.ADMIN, Role.DOCTOR, Role.DOCTOR_ASSISTANT)
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.patientsService.findAll({
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @Roles(Role.RECEPTIONIST, Role.ADMIN, Role.DOCTOR, Role.DOCTOR_ASSISTANT)
  async findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.patientsService.update(id, dto, userId);
  }
}

