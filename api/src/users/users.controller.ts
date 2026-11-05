import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ResetPasswordDto } from './dto/create-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin/users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @CurrentUser('id') adminId: string) {
    return this.usersService.createUser(dto, adminId);
  }

  @Get()
  async findAll(
    @Query('role') role?: Role,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive === undefined ? undefined : isActive === 'true';
    return this.usersService.findAll({ role, search, isActive: isActiveBool });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.usersService.updateUser(id, dto, adminId);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.usersService.toggleUserStatus(id, adminId);
  }

  @Post(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.usersService.resetPassword(id, dto, adminId);
  }
}

