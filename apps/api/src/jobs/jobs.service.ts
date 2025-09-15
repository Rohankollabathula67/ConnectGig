import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, clientId: string) {
    const { latitude, longitude, address, city, state, country, ...jobData } = createJobDto;

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        clientId,
        scheduledDate: createJobDto.scheduledDate ? new Date(createJobDto.scheduledDate) : null,
        location: {
          create: {
            latitude,
            longitude,
            address,
            city,
            state,
            country,
          },
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
    });

    return job;
  }

  async findAll(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    urgency?: string;
    city?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters?.urgency) {
      where.urgency = filters.urgency;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.city) {
      where.location = {
        city: {
          contains: filters.city,
          mode: 'insensitive',
        },
      };
    }

    return this.prisma.job.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        location: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string) {
    const job = await this.findOne(id);

    // Only the client who created the job can update it
    if (job.clientId !== userId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    // Only allow updates if job is still pending
    if (job.status !== 'PENDING') {
      throw new ForbiddenException('Cannot update job that is already in progress or completed');
    }

    const { latitude, longitude, address, city, state, country, ...jobData } = updateJobDto;

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        ...jobData,
        scheduledDate: updateJobDto.scheduledDate ? new Date(updateJobDto.scheduledDate) : undefined,
        location: {
          update: {
            latitude,
            longitude,
            address,
            city,
            state,
            country,
          },
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
    });

    return updatedJob;
  }

  async remove(id: string, userId: string) {
    const job = await this.findOne(id);

    // Only the client who created the job can delete it
    if (job.clientId !== userId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }

    // Only allow deletion if job is still pending
    if (job.status !== 'PENDING') {
      throw new ForbiddenException('Cannot delete job that is already in progress or completed');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return { message: 'Job deleted successfully' };
  }

  async acceptJob(jobId: string, workerId: string) {
    const job = await this.findOne(jobId);

    if (job.status !== 'PENDING') {
      throw new ForbiddenException('Job is not available for acceptance');
    }

    if (job.workerId) {
      throw new ForbiddenException('Job is already assigned to a worker');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        workerId,
        status: 'ACCEPTED',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
    });

    return updatedJob;
  }

  async updateJobStatus(jobId: string, status: string, userId: string) {
    const job = await this.findOne(jobId);

    // Only the assigned worker or client can update status
    if (job.workerId !== userId && job.clientId !== userId) {
      throw new ForbiddenException('You are not authorized to update this job status');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: { status: status as any },
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

    return updatedJob;
  }

  async findJobsByWorker(workerId: string) {
    return this.prisma.job.findMany({
      where: { workerId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findJobsByClient(clientId: string) {
    return this.prisma.job.findMany({
      where: { clientId },
      include: {
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
        createdAt: 'desc',
      },
    });
  }

  async addReview(jobId: string, userId: string, rating: number, text: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } })
    if (!job) throw new Error('Job not found')
    if (job.clientId !== userId) throw new Error('Only the client can review this job')
    if (job.status !== 'COMPLETED') throw new Error('Can only review completed jobs')

    const review = await this.prisma.review.create({
      data: {
        jobId,
        reviewerId: userId,
        rating,
        text,
      },
    })
    return review
  }

  async listReviews(jobId: string) {
    return this.prisma.review.findMany({
      where: { jobId },
      include: {
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
