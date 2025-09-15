import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobWorkflowController } from './job-workflow.controller';
import { JobWorkflowService } from './job-workflow.service';

@Module({
  imports: [DatabaseModule],
  controllers: [JobsController, JobWorkflowController],
  providers: [JobsService, JobWorkflowService],
  exports: [JobsService, JobWorkflowService],
})
export class JobsModule {}
