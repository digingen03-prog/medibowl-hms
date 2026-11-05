import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, PaymentMethod } from '@prisma/client';

@Controller('payments')
@Roles(Role.ADMIN, Role.DOCTOR_ASSISTANT)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll(
    @Query('visitId') visitId?: string,
    @Query('method') method?: PaymentMethod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsService.findAll({
      visitId,
      method,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}

