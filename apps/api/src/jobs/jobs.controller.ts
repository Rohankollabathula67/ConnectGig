import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  async create(@Body() createJobDto: CreateJobDto, @Request() req: any) {
    const userId = req.user.id as string
    return this.jobsService.create(createJobDto, userId)
  }

  @Get()
  @ApiOperation({ summary: 'List jobs' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'urgency', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query() query: any) {
    return this.jobsService.findAll(query)
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available jobs for workers' })
  @ApiResponse({ status: 200, description: 'List of available jobs' })
  async findAvailableJobs() {
    return this.jobsService.findAll({ status: 'PENDING' });
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Get('my-jobs')
  @ApiOperation({ summary: 'Get jobs created by current user' })
  async findMyJobs(@Request() req: any) {
    const userId = req.user.id as string
    return this.jobsService.findJobsByClient(userId)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Get('assigned')
  @ApiOperation({ summary: 'Get jobs assigned to the current worker' })
  @ApiResponse({ status: 200, description: 'List of assigned jobs' })
  async findAssignedJobs(@Request() req: any) {
    const userId = req.user.id as string
    return this.jobsService.findJobsByWorker(userId)
  }

  @Get('my-active')
  @ApiOperation({ summary: 'Get current user active jobs' })
  @ApiResponse({ status: 200, description: 'Active jobs retrieved' })
  async getMyActiveJobs(@Request() req: any) {
    // TODO: Add JWT guard and extract userId from token
    const userId = 'cmexr8dzj0000g1wwpgcrq831'; // Temporary for testing - real user ID
    
    // Get jobs in progress or accepted for the user
    const inProgressJobs = await this.jobsService.findAll({ status: 'IN_PROGRESS' });
    const acceptedJobs = await this.jobsService.findAll({ status: 'ACCEPTED' });
    
    // Filter by user involvement
    const userInProgressJobs = inProgressJobs.filter(job => 
      job.clientId === userId || job.workerId === userId
    );
    const userAcceptedJobs = acceptedJobs.filter(job => 
      job.clientId === userId || job.workerId === userId
    );
    
    return {
      inProgress: userInProgressJobs,
      accepted: userAcceptedJobs,
    };
  }

  @Get('my-completed')
  @ApiOperation({ summary: 'Get current user completed jobs' })
  @ApiResponse({ status: 200, description: 'Completed jobs retrieved' })
  async getMyCompletedJobs(@Request() req: any) {
    // TODO: Add JWT guard and extract userId from token
    const userId = 'cmexr8dzj0000g1wwpgcrq831'; // Temporary for testing - real user ID
    
    const completedJobs = await this.jobsService.findAll({ status: 'COMPLETED' });
    const userCompletedJobs = completedJobs.filter(job => 
      job.clientId === userId || job.workerId === userId
    );
    
    return userCompletedJobs;
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get jobs by status' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  @ApiQuery({ name: 'status', required: true, description: 'Job status to filter by' })
  async getJobsByStatus(@Param('status') status: string, @Request() req: any) {
    // TODO: Add JWT guard and extract userId from token
    const userId = 'cmexr8dzj0000g1wwpgcrq831'; // Temporary for testing - real user ID
    
    const jobs = await this.jobsService.findAll({ status });
    
    // For non-pending statuses, filter by user involvement
    if (status !== 'PENDING') {
      return jobs.filter(job => 
        job.clientId === userId || job.workerId === userId
      );
    }
    
    return jobs;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, description: 'Job found' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update job' })
  @ApiResponse({ status: 200, description: 'Job successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @Request() req: any) {
    const userId = req.user.id as string
    return this.jobsService.update(id, updateJobDto, userId)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete job' })
  @ApiResponse({ status: 200, description: 'Job successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id as string
    return this.jobsService.remove(id, userId)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update job status' })
  @ApiResponse({ status: 200, description: 'Job status updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: any,
  ) {
    const userId = req.user.id as string
    return this.jobsService.updateJobStatus(id, body.status, userId)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Post(':id/reviews')
  @ApiOperation({ summary: 'Add a review to a completed job (client only)' })
  async addReview(
    @Param('id') id: string,
    @Body() body: { rating: number; text: string },
    @Request() req: any,
  ) {
    const userId = req.user.id as string
    return this.jobsService.addReview(id, userId, Number(body.rating), body.text)
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'List reviews for a job' })
  async listReviews(@Param('id') id: string) {
    return this.jobsService.listReviews(id)
  }
}
