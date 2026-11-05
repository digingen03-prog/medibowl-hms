import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePatientDto } from '../../patients/dto/create-patient.dto';

export class CreateVisitDto {
  // Either an existing patientId is passed OR newPatient data is provided
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePatientDto)
  newPatient?: CreatePatientDto;

  @IsNotEmpty({ message: 'Doctor assignment is required' })
  @IsUUID()
  doctorId: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

