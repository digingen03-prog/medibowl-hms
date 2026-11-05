import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/reports')
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('registrations')
  async getDailyRegistrations(@Query('days') days?: string) {
    return this.reportsService.getDailyRegistrations(days ? parseInt(days, 10) : 7);
  }

  @Get('doctor-wise')
  async getDoctorWise() {
    return this.reportsService.getDoctorWisePatientCount();
  }

  @Get('collections')
  async getDailyCollections(@Query('days') days?: string) {
    return this.reportsService.getDailyFeeCollection(days ? parseInt(days, 10) : 7);
  }

  @Get('outstanding')
  async getOutstanding() {
    return this.reportsService.getOutstandingBalances();
  }

  @Get('detailed-payments')
  async getDetailedPayments(
    @Query('search') search?: string,
    @Query('method') method?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    return this.reportsService.getDetailedPaymentsReport({
      search,
      method,
      startDate,
      endDate,
      doctorId,
    });
  }
}

