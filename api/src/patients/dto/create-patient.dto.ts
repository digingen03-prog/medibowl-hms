import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @IsNotEmpty({ message: 'Patient full name is required' })
  @IsString()
  fullName: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsNumber({}, { message: 'Age must be a valid number' })
  @Min(0, { message: 'Age must be at least 0' })
  @Max(130, { message: 'Age must be realistic' })
  age: number;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsEnum(Gender, { message: 'Gender must be MALE, FEMALE, or OTHER' })
  gender: Gender;

  @IsNotEmpty({ message: 'Mobile number is required' })
  @IsString()
  @Matches(/^[0-9+\-\s()]{7,15}$/, { message: 'Mobile number must be a valid phone number' })
  mobileNumber: string;

  @IsOptional()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(130)
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]{7,15}$/)
  mobileNumber?: string;

  @IsOptional()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

