import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultConsultationFee?: number;

  @IsOptional()
  isActive?: boolean;
}

