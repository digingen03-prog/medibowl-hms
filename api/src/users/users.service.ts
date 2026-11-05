import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ResetPasswordDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createUser(dto: CreateUserDto, adminId?: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: dto.email, mode: 'insensitive' as const } },
          ...(dto.username ? [{ username: { equals: dto.username, mode: 'insensitive' as const } }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('A user with this email or username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          username: dto.username || dto.email.split('@')[0],
          passwordHash,
          role: dto.role,
          isActive: true,
        },
      });

      if (dto.role === Role.DOCTOR) {
        await tx.doctor.create({
          data: {
            userId: createdUser.id,
            specialization: dto.specialization || 'General Physician',
            defaultConsultationFee: dto.defaultConsultationFee !== undefined ? dto.defaultConsultationFee : 500.00,
            isActive: true,
          },
        });
      }

      return createdUser;
    });

    await this.auditService.log({
      userId: adminId,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      newValues: { name: user.name, email: user.email, role: user.role },
    });

    return this.findOne(user.id);
  }

  async findAll(params?: { role?: Role; search?: string; isActive?: boolean }) {
    const where: any = {};

    if (params?.role) {
      where.role = params.role;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { username: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        doctorProfile: {
          select: {
            id: true,
            specialization: true,
            defaultConsultationFee: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        doctorProfile: {
          select: {
            id: true,
            specialization: true,
            defaultConsultationFee: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto, adminId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { doctorProfile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check duplicate email
    if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (emailTaken) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const userUpdateData: any = {};
      if (dto.name) userUpdateData.name = dto.name;
      if (dto.email) userUpdateData.email = dto.email.toLowerCase();
      if (dto.username) userUpdateData.username = dto.username;
      if (dto.role) userUpdateData.role = dto.role;
      if (dto.isActive !== undefined) userUpdateData.isActive = dto.isActive;

      const u = await tx.user.update({
        where: { id },
        data: userUpdateData,
      });

      // If user is doctor or became doctor
      if (dto.role === Role.DOCTOR || user.role === Role.DOCTOR) {
        if (user.doctorProfile) {
          await tx.doctor.update({
            where: { id: user.doctorProfile.id },
            data: {
              specialization: dto.specialization !== undefined ? dto.specialization : user.doctorProfile.specialization,
              defaultConsultationFee: dto.defaultConsultationFee !== undefined ? dto.defaultConsultationFee : user.doctorProfile.defaultConsultationFee,
              isActive: dto.isActive !== undefined ? dto.isActive : user.doctorProfile.isActive,
            },
          });
        } else if (dto.role === Role.DOCTOR) {
          await tx.doctor.create({
            data: {
              userId: u.id,
              specialization: dto.specialization || 'General Physician',
              defaultConsultationFee: dto.defaultConsultationFee !== undefined ? dto.defaultConsultationFee : 500.00,
              isActive: true,
            },
          });
        }
      }

      return u;
    });

    await this.auditService.log({
      userId: adminId,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: id,
      previousValues: { name: user.name, email: user.email, role: user.role, isActive: user.isActive },
      newValues: dto,
    });

    return this.findOne(id);
  }

  async toggleUserStatus(id: string, adminId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.id === adminId) {
      throw new BadRequestException('Administrators cannot deactivate their own account');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    // If doctor, also update doctor active status
    await this.prisma.doctor.updateMany({
      where: { userId: id },
      data: { isActive: updated.isActive },
    });

    await this.auditService.log({
      userId: adminId,
      action: updated.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: id,
      newValues: { isActive: updated.isActive },
    });

    return { id: updated.id, isActive: updated.isActive };
  }

  async resetPassword(id: string, dto: ResetPasswordDto, adminId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'USER_PASSWORD_RESET',
      entityType: 'User',
      entityId: id,
    });

    return { message: 'Password has been reset successfully' };
  }
}
