import { Module } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { SequenceService } from '../common/services/sequence.service';

@Module({
  controllers: [VisitsController],
  providers: [VisitsService, SequenceService],
  exports: [VisitsService],
})
export class VisitsModule {}

