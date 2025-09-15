import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { AddSkillDto } from './dto/add-skill.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkerDto: CreateWorkerDto, userId: string) {
    // Check if user already has a worker profile
    const existingWorker = await this.prisma.worker.findUnique({
      where: { userId },
    });

    if (existingWorker) {
      throw new ConflictException('User already has a worker profile');
    }

    const { latitude, longitude, address, city, state, country, ...workerData } = createWorkerDto;

    const worker = await this.prisma.worker.create({
      data: {
        ...workerData,
        userId,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        location: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return worker;
  }

  async findAll(filters?: {
    category?: string;
    minHourlyRate?: number;
    maxHourlyRate?: number;
    availability?: string;
    city?: string;
    skillLevel?: string;
  }) {
    const where: any = {};

    if (filters?.minHourlyRate || filters?.maxHourlyRate) {
      where.hourlyRate = {};
      if (filters.minHourlyRate) where.hourlyRate.gte = filters.minHourlyRate;
      if (filters.maxHourlyRate) where.hourlyRate.lte = filters.maxHourlyRate;
    }

    if (filters?.availability) {
      where.availability = filters.availability;
    }

    if (filters?.city) {
      where.location = {
        city: {
          contains: filters.city,
          mode: 'insensitive',
        },
      };
    }

    if (filters?.category || filters?.skillLevel) {
      where.skills = {
        some: {},
      };

      if (filters?.category) {
        where.skills.some.category = filters.category;
      }

      if (filters?.skillLevel) {
        where.skills.some.level = filters.skillLevel;
      }
    }

    return this.prisma.worker.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        ratingAvg: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        location: true,
        skills: {
          include: {
            skill: true,
          },
        },
        documents: true,
      },
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    return worker;
  }

  async findByUserId(userId: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        location: true,
        skills: {
          include: {
            skill: true,
          },
        },
        documents: true,
      },
    });

    if (!worker) {
      throw new NotFoundException('Worker profile not found');
    }

    return worker;
  }

  async update(id: string, updateWorkerDto: UpdateWorkerDto, userId: string) {
    const worker = await this.findOne(id);

    // Only the worker can update their own profile
    if (worker.userId !== userId) {
      throw new ConflictException('You can only update your own worker profile');
    }

    const { latitude, longitude, address, city, state, country, ...workerData } = updateWorkerDto;

    const updatedWorker = await this.prisma.worker.update({
      where: { id },
      data: {
        ...workerData,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        location: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return updatedWorker;
  }

  async remove(id: string, userId: string) {
    const worker = await this.findOne(id);

    // Only the worker can delete their own profile
    if (worker.userId !== userId) {
      throw new ConflictException('You can only delete your own worker profile');
    }

    await this.prisma.worker.delete({
      where: { id },
    });

    return { message: 'Worker profile deleted successfully' };
  }

  async addSkill(workerId: string, addSkillDto: AddSkillDto, userId: string) {
    const worker = await this.findOne(workerId);

    // Only the worker can add skills to their own profile
    if (worker.userId !== userId) {
      throw new ConflictException('You can only add skills to your own profile');
    }

    // Check if skill already exists
    const existingSkill = await this.prisma.workerSkill.findFirst({
      where: {
        workerId,
        skill: {
          name: addSkillDto.skillName,
          category: addSkillDto.category,
        },
      },
    });

    if (existingSkill) {
      throw new ConflictException('Skill already exists for this worker');
    }

    // Find or create the skill
    let skill = await this.prisma.skill.findFirst({
      where: {
        name: addSkillDto.skillName,
        category: addSkillDto.category,
      },
    });

    if (!skill) {
      skill = await this.prisma.skill.create({
        data: {
          name: addSkillDto.skillName,
          category: addSkillDto.category,
        },
      });
    }

    // Add skill to worker
    const workerSkill = await this.prisma.workerSkill.create({
      data: {
        workerId,
        skillId: skill.id,
        level: addSkillDto.level,
      },
      include: {
        skill: true,
      },
    });

    return workerSkill;
  }

  async removeSkill(workerId: string, skillId: string, userId: string) {
    const worker = await this.findOne(workerId);

    // Only the worker can remove skills from their own profile
    if (worker.userId !== userId) {
      throw new ConflictException('You can only remove skills from your own profile');
    }

    await this.prisma.workerSkill.delete({
      where: {
        workerId_skillId: {
          workerId,
          skillId,
        },
      },
    });

    return { message: 'Skill removed successfully' };
  }

  async updateAvailability(workerId: string, availability: string, userId: string) {
    const worker = await this.findOne(workerId);

    // Only the worker can update their own availability
    if (worker.userId !== userId) {
      throw new ConflictException('You can only update your own availability');
    }

    const updatedWorker = await this.prisma.worker.update({
      where: { id: workerId },
      data: { availability: availability as any },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
      },
    });

    return updatedWorker;
  }

  async getTopRatedWorkers(limit: number = 10) {
    return this.prisma.worker.findMany({
      where: {
        ratingAvg: {
          gt: 0,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        ratingAvg: 'desc',
      },
      take: limit,
    });
  }
}
