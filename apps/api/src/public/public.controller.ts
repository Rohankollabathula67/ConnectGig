import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('public')
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('jobs')
  async listJobs(@Query('status') status?: string) {
    const jobs = await this.prisma.job.findMany({
      where: {
        status: status ? (status as any) : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
      },
      take: 50,
    });
    return jobs.map((j) => ({
      id: j.id,
      title: j.title,
      description: j.description,
      category: j.category,
      price: j.price,
      status: j.status,
      urgency: j.urgency,
      location: j.location ? { address: j.location.address, city: j.location.city } : undefined,
      createdAt: j.createdAt,
    }));
  }
}


