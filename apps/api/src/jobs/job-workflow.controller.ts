import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobWorkflowService } from './job-workflow.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@ApiTags('Job Workflow')
@Controller('jobs')
export class JobWorkflowController {
  constructor(private readonly jobWorkflowService: JobWorkflowService) {}

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a job (for workers)' })
  @ApiResponse({ status: 200, description: 'Job successfully accepted' })
  @ApiResponse({ status: 400, description: 'Job not available for acceptance' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async acceptJob(
    @Param('id') id: string,
    @Body() body: { workerId: string },
    @Request() req: any,
  ) {
    const userId = req.user.id as string;
    return this.jobWorkflowService.acceptJob(id, body.workerId, userId);
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/start')
  @ApiOperation({ summary: 'Start work on a job (for workers)' })
  @ApiResponse({ status: 200, description: 'Job started successfully' })
  @ApiResponse({ status: 400, description: 'Job must be accepted first' })
  @ApiResponse({ status: 403, description: 'Only assigned worker can start job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async startJob(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id as string;
    return this.jobWorkflowService.startJob(id, userId);
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a job (for workers)' })
  @ApiResponse({ status: 200, description: 'Job completed successfully' })
  @ApiResponse({ status: 400, description: 'Job must be in progress first' })
  @ApiResponse({ status: 403, description: 'Only assigned worker can complete job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async completeJob(
    @Param('id') id: string,
    @Body() body: { completionNotes?: string },
    @Request() req: any,
  ) {
    const userId = req.user.id as string;
    return this.jobWorkflowService.completeJob(id, userId, body.completionNotes);
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a job (for clients or workers)' })
  @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed job' })
  @ApiResponse({ status: 403, description: 'Not authorized to cancel this job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async cancelJob(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    const userId = req.user.id as string;
    return this.jobWorkflowService.cancelJob(id, userId, body.reason);
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Post(':id/revision-request')
  @ApiOperation({ summary: 'Request job revision (for clients)' })
  @ApiResponse({ status: 200, description: 'Revision request submitted' })
  @ApiResponse({ status: 400, description: 'Job must be completed first' })
  @ApiResponse({ status: 403, description: 'Only client can request revisions' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async requestRevision(
    @Param('id') id: string,
    @Body() body: { revisionNotes: string },
    @Request() req: any,
  ) {
    const userId = req.user.id as string;
    return this.jobWorkflowService.requestJobRevision(id, userId, body.revisionNotes);
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Get(':id/workflow-history')
  @ApiOperation({ summary: 'Get job workflow history' })
  @ApiResponse({ status: 200, description: 'Workflow history retrieved' })
  @ApiResponse({ status: 403, description: 'Not authorized to view this job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getWorkflowHistory(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id as string;
    return this.jobWorkflowService.getJobWorkflowHistory(id, userId);
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Get('status/:status')
  @ApiOperation({ summary: 'Get jobs by status' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  @ApiQuery({ name: 'status', required: true, description: 'Job status to filter by' })
  async getJobsByStatus(@Param('status') status: string, @Request() req: any) {
    const userId = req.user.id as string;
    return this.jobWorkflowService.getJobsByStatus(status, userId);
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Get('my-active')
  @ApiOperation({ summary: 'Get current user active jobs' })
  @ApiResponse({ status: 200, description: 'Active jobs retrieved' })
  async getMyActiveJobs(@Request() req: any) {
    const userId = req.user.id as string;
    const inProgressJobs = await this.jobWorkflowService.getJobsByStatus('IN_PROGRESS', userId);
    const acceptedJobs = await this.jobWorkflowService.getJobsByStatus('ACCEPTED', userId);
    return { inProgress: inProgressJobs, accepted: acceptedJobs };
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Get('my-completed')
  @ApiOperation({ summary: 'Get current user completed jobs' })
  @ApiResponse({ status: 200, description: 'Completed jobs retrieved' })
  async getMyCompletedJobs(@Request() req: any) {
    const userId = req.user.id as string;
    return this.jobWorkflowService.getJobsByStatus('COMPLETED', userId);
  }
}
