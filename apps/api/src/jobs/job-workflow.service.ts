import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JobsService } from './jobs.service';

@Injectable()
export class JobWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  async acceptJob(jobId: string, workerId: string, userId: string) {
    const job = await this.jobsService.findOne(jobId);

    // Verify the user is the worker
    if (userId !== workerId) {
      throw new ForbiddenException('You can only accept jobs for yourself');
    }

    // Check if job is available for acceptance
    if (job.status !== 'PENDING') {
      throw new BadRequestException('Job is not available for acceptance');
    }

    if (job.workerId) {
      throw new BadRequestException('Job is already assigned to a worker');
    }

    // Update job status and assign worker
    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        workerId,
        status: 'ACCEPTED',
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
    });

    // TODO: Send notification to client that job was accepted
    // TODO: Send notification to worker with job details

    return updatedJob;
  }

  async startJob(jobId: string, userId: string) {
    const job = await this.jobsService.findOne(jobId);

    // Only the assigned worker can start the job
    if (job.workerId !== userId) {
      throw new ForbiddenException('Only the assigned worker can start this job');
    }

    if (job.status !== 'ACCEPTED') {
      throw new BadRequestException('Job must be accepted before it can be started');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
    });

    // TODO: Send notification to client that work has started
    // TODO: Send notification to worker with job details

    return updatedJob;
  }

  async completeJob(jobId: string, userId: string, completionNotes?: string) {
    const job = await this.jobsService.findOne(jobId);

    // Only the assigned worker can complete the job
    if (job.workerId !== userId) {
      throw new ForbiddenException('Only the assigned worker can complete this job');
    }

    if (job.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Job must be in progress before it can be completed');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
    });

    // TODO: Send notification to client that job is completed
    // TODO: Send notification to worker
    // TODO: Trigger payment process
    // TODO: Request review from client

    return updatedJob;
  }

  async cancelJob(jobId: string, userId: string, reason: string) {
    const job = await this.jobsService.findOne(jobId);

    // Only the client or assigned worker can cancel the job
    if (job.clientId !== userId && job.workerId !== userId) {
      throw new ForbiddenException('You are not authorized to cancel this job');
    }

    if (job.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed job');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
    });

    // TODO: Send notification to both parties
    // TODO: Handle payment refund if necessary
    // TODO: Update worker availability

    return updatedJob;
  }

  async requestJobRevision(jobId: string, userId: string, revisionNotes: string) {
    const job = await this.jobsService.findOne(jobId);

    // Only the client can request revisions
    if (job.clientId !== userId) {
      throw new ForbiddenException('Only the client can request job revisions');
    }

    if (job.status !== 'COMPLETED') {
      throw new BadRequestException('Job must be completed before requesting revisions');
    }

    // TODO: Implement revision logic
    // This could involve:
    // - Creating a new job for the revision
    // - Updating the original job status
    // - Notifying the worker

    return { message: 'Revision request submitted successfully' };
  }

  async getJobWorkflowHistory(jobId: string, userId: string) {
    const job = await this.jobsService.findOne(jobId);

    // Only the client or assigned worker can view workflow history
    if (job.clientId !== userId && job.workerId !== userId) {
      throw new ForbiddenException('You are not authorized to view this job history');
    }

    // TODO: Implement workflow history tracking
    // This could involve:
    // - Status change timestamps
    // - User actions
    // - Communication logs

    return {
      jobId,
      currentStatus: job.status,
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: job.createdAt,
          description: 'Job posted',
        },
        // Add more status changes as they occur
      ],
    };
  }

  async getJobsByStatus(status: string, userId: string) {
    let whereClause: any = { status };

    // Filter by user role
    if (status === 'PENDING') {
      // Anyone can see pending jobs
    } else {
      // For other statuses, user must be involved
      whereClause.OR = [
        { clientId: userId },
        { workerId: userId },
      ];
    }

    return this.prisma.job.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}
