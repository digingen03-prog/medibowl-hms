import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { SequenceService } from '../common/services/sequence.service';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, SequenceService],
  exports: [PatientsService],
})
export class PatientsModule {}

