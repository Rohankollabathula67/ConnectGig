import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService, MatchingCriteria } from './matching.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@ApiTags('Matching')
@Controller('matching')
@UseGuards(ClerkAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('jobs/:jobId/workers')
  @ApiOperation({ summary: 'Find best workers for a specific job' })
  @ApiResponse({ status: 200, description: 'List of matched workers with scores' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findWorkersForJob(
    @Param('jobId') jobId: string,
    @Query('maxDistance') maxDistance?: string,
    @Query('minRating') minRating?: string,
    @Query('maxHourlyRate') maxHourlyRate?: string,
    @Query('requiredSkills') requiredSkills?: string,
  ) {
    const criteria: MatchingCriteria = {
      jobId,
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxHourlyRate: maxHourlyRate ? parseFloat(maxHourlyRate) : undefined,
      requiredSkills: requiredSkills ? requiredSkills.split(',') : undefined,
    };

    return this.matchingService.findBestWorkersForJob(criteria);
  }

  @Get('workers/:workerId/jobs')
  @ApiOperation({ summary: 'Find best jobs for a specific worker' })
  @ApiResponse({ status: 200, description: 'List of matched jobs with scores' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async findJobsForWorker(
    @Param('workerId') workerId: string,
    @Query('maxDistance') maxDistance?: string,
  ) {
    const maxDist = maxDistance ? parseFloat(maxDistance) : 50;
    return this.matchingService.findBestJobsForWorker(workerId, maxDist);
  }

  @Get('workers/:workerId/recommendations')
  @ApiOperation({ summary: 'Get personalized job recommendations for a worker' })
  @ApiResponse({ status: 200, description: 'Personalized job recommendations' })
  async getWorkerRecommendations(
    @Param('workerId') workerId: string,
    @Query('limit') limit?: string,
  ) {
    const maxDist = 50;
    const jobLimit = limit ? parseInt(limit) : 10;
    
    const jobs = await this.matchingService.findBestJobsForWorker(workerId, maxDist);
    return jobs.slice(0, jobLimit);
  }

  @Get('jobs/:jobId/recommendations')
  @ApiOperation({ summary: 'Get top worker recommendations for a job' })
  @ApiResponse({ status: 200, description: 'Top worker recommendations' })
  async getJobRecommendations(
    @Param('jobId') jobId: string,
    @Query('limit') limit?: string,
  ) {
    const criteria: MatchingCriteria = { jobId };
    const workerLimit = limit ? parseInt(limit) : 10;
    
    const workers = await this.matchingService.findBestWorkersForJob(criteria);
    return workers.slice(0, workerLimit);
  }

  @Post('smart-match')
  @ApiOperation({ summary: 'Smart matching with advanced criteria' })
  @ApiResponse({ status: 200, description: 'Smart matching results' })
  async smartMatch(@Body() criteria: MatchingCriteria) {
    return this.matchingService.findBestWorkersForJob(criteria);
  }
}
