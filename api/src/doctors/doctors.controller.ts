import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // Receptionist, Doctor, Doctor Assistant, Admin can all list doctors
  @Get()
  async findAll(@Query('all') all?: string) {
    const onlyActive = all !== 'true';
    return this.doctorsService.findAll(onlyActive);
  }

  @Get('me')
  @Roles(Role.DOCTOR)
  async getMyDoctorProfile(@CurrentUser('id') userId: string) {
    return this.doctorsService.findByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.doctorsService.update(id, dto, adminId);
  }
}

