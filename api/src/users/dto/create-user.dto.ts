import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsNumber, Min } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  // Fields if role is DOCTOR
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultConsultationFee?: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  isActive?: boolean;

  // Fields if role is DOCTOR
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultConsultationFee?: number;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

