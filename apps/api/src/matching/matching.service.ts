import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface MatchScore {
  workerId: string;
  score: number;
  reasons: string[];
  distance?: number;
  skillMatch?: number;
  availability?: boolean;
  rating?: number;
}

export interface MatchingCriteria {
  jobId: string;
  category?: string;
  maxDistance?: number;
  minRating?: number;
  maxHourlyRate?: number;
  requiredSkills?: string[];
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findBestWorkersForJob(criteria: MatchingCriteria): Promise<MatchScore[]> {
    try {
      const job = await this.prisma.job.findUnique({
        where: { id: criteria.jobId },
        include: { location: true },
      });

      if (!job) throw new Error('Job not found');

      const workers = await this.getWorkersWithSkills(job.category, criteria.requiredSkills);
      const matchScores: MatchScore[] = [];

      for (const worker of workers) {
        const score = await this.calculateMatchScore(worker, job, criteria);
        if (score.score > 0) {
          matchScores.push(score);
        }
      }

      return matchScores.sort((a, b) => b.score - a.score).slice(0, 20);
    } catch (error) {
      this.logger.error('Error finding best workers for job:', error);
      throw error;
    }
  }

  private async getWorkersWithSkills(category: string, requiredSkills?: string[]) {
    const whereClause: any = {
      availability: 'AVAILABLE',
      skills: {
        some: {
          skill: { category: category },
        },
      },
    };

    if (requiredSkills?.length > 0) {
      whereClause.skills.some.skill.name = { in: requiredSkills };
    }

    return this.prisma.worker.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        skills: { include: { skill: true } },
        location: true,
      },
    });
  }

  private async calculateMatchScore(worker: any, job: any, criteria: MatchingCriteria): Promise<MatchScore> {
    let score = 0;
    const reasons: string[] = [];

    // Skill match (40%)
    const skillScore = this.calculateSkillMatch(worker.skills, job.category, criteria.requiredSkills);
    score += skillScore.score;
    reasons.push(...skillScore.reasons);

    // Location match (30%)
    const locationScore = await this.calculateLocationMatch(worker.location, job.location, criteria.maxDistance);
    score += locationScore.score;
    reasons.push(...locationScore.reasons);

    // Availability & rating (20%)
    const availabilityScore = this.calculateAvailabilityScore(worker);
    score += availabilityScore.score;
    reasons.push(...availabilityScore.reasons);

    // Price compatibility (10%)
    const priceScore = this.calculatePriceCompatibility(worker.hourlyRate, job.price);
    score += priceScore.score;
    reasons.push(...priceScore.reasons);

    return {
      workerId: worker.id,
      score: Math.round(score * 100) / 100,
      reasons,
      distance: locationScore.distance,
      skillMatch: skillScore.matchPercentage,
      availability: worker.availability === 'AVAILABLE',
      rating: worker.ratingAvg,
    };
  }

  private calculateSkillMatch(workerSkills: any[] = [], jobCategory: string, requiredSkills?: string[]) {
    let score = 0;
    const reasons: string[] = [];

    const wsArr = Array.isArray(workerSkills) ? workerSkills : [];
    const required = Array.isArray(requiredSkills) ? requiredSkills : [];

    // has skills in same category
    const categorySkills = wsArr.filter((ws: any) => ws?.skill?.category === jobCategory);
    if (categorySkills.length > 0) {
      score += 20;
      reasons.push(`Has ${jobCategory} skills`);
    }

    // required skills matching (safe division)
    if (required.length > 0) {
      const workerSkillNames = wsArr.map((ws: any) => ws?.skill?.name).filter(Boolean) as string[];
      const matchedSkills = required.filter(rs => workerSkillNames.includes(rs));
      score += (matchedSkills.length / required.length) * 20;
      reasons.push(`Matches ${matchedSkills.length}/${required.length} required skills`);
    }

    // expert-level boost
    const expertSkills = categorySkills.filter((ws: any) => {
      const level = (ws?.level ?? ws?.skill?.level ?? '').toString().toUpperCase();
      return level === 'EXPERT';
    });
    if (expertSkills.length > 0) {
      score += 10;
      reasons.push(`${expertSkills.length} expert-level skills`);
    }

    const matchPercentage = Math.min(100, (score / 50) * 100);
    return { score, matchPercentage, reasons };
  }

  private async calculateLocationMatch(workerLocation: any, jobLocation: any, maxDistance?: number) {
    if (!workerLocation || !jobLocation) {
      return { score: 0, reasons: ['Location data unavailable'] };
    }

    try {
      const result = await this.prisma.$queryRaw`
        SELECT ST_Distance(
          ST_SetSRID(ST_MakePoint(${workerLocation.longitude}, ${workerLocation.latitude}), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${jobLocation.longitude}, ${jobLocation.latitude}), 4326)::geography
        ) / 1000 as distance_km
      `;

      const resArr = result as any[];
      const distance = parseFloat(resArr[0]?.distance_km || '0');
      let score = 0;
      const reasons: string[] = [];

      if (distance <= 5) {
        score = 30;
        reasons.push('Very close location (< 5km)');
      } else if (distance <= 15) {
        score = 25;
        reasons.push('Close location (< 15km)');
      } else if (distance <= 30) {
        score = 20;
        reasons.push('Moderate distance (< 30km)');
      } else if (distance <= 50) {
        score = 15;
        reasons.push('Acceptable distance (< 50km)');
      }

      if (maxDistance && distance > maxDistance) {
        score = 0;
        reasons.push(`Exceeds maximum distance (${maxDistance}km)`);
      }

      return { score, distance, reasons };
    } catch (error) {
      this.logger.error('Error calculating location distance:', error);
      return { score: 0, reasons: ['Error calculating distance'] };
    }
  }

  private calculateAvailabilityScore(worker: any) {
    let score = 0;
    const reasons: string[] = [];

    if (worker.availability === 'AVAILABLE') {
      score += 15;
      reasons.push('Currently available');
    } else if (worker.availability === 'BUSY') {
      score += 5;
      reasons.push('Currently busy but may be available soon');
    }

    if (worker.ratingAvg >= 4.5) {
      score += 5;
      reasons.push('High rating (4.5+)');
    } else if (worker.ratingAvg >= 4.0) {
      score += 3;
      reasons.push('Good rating (4.0+)');
    }

    if (worker.jobsCompleted >= 50) {
      score += 5;
      reasons.push('Highly experienced (50+ jobs)');
    } else if (worker.jobsCompleted >= 20) {
      score += 3;
      reasons.push('Experienced (20+ jobs)');
    }

    return { score, reasons };
  }

  private calculatePriceCompatibility(workerHourlyRate: number, jobPrice: number) {
    let score = 0;
    const reasons: string[] = [];

    const estimatedHours = jobPrice / workerHourlyRate;
    if (estimatedHours >= 1 && estimatedHours <= 8) {
      score += 10;
      reasons.push('Price compatible with hourly rate');
    } else if (estimatedHours > 8) {
      score += 5;
      reasons.push('Long-term job opportunity');
    }

    return { score, reasons };
  }

  /**
   * Find the best jobs for a specific worker
   */
  async findBestJobsForWorker(workerId: string, maxDistance = 50): Promise<any[]> {
    try {
      // Get worker details
      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          location: true,
        },
      });

      if (!worker) {
        throw new Error('Worker not found');
      }

      // Get available jobs in worker's skill categories
      const skillCategories = worker.skills.map(ws => ws.skill.category);
      const jobs = await this.prisma.job.findMany({
        where: {
          status: 'PENDING',
          category: { in: skillCategories },
        },
        include: {
          location: true,
                      client: {
              select: {
                id: true,
                name: true,
              },
            },
        },
      });

      // Calculate match scores for each job
      const jobMatches = [];
      for (const job of jobs) {
        const score = await this.calculateJobMatchScore(job, worker, maxDistance);
        if (score.score > 0) {
          jobMatches.push({
            ...job,
            matchScore: score.score,
            matchReasons: score.reasons,
            distance: score.distance,
          });
        }
      }

      // Sort by score and return
      return jobMatches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20);

    } catch (error) {
      this.logger.error('Error finding best jobs for worker:', error);
      throw error;
    }
  }

  /**
   * Calculate job match score for worker perspective
   */
  private async calculateJobMatchScore(job: any, worker: any, maxDistance: number): Promise<{ score: number; reasons: string[]; distance?: number }> {
    let score = 0;
    const reasons: string[] = [];

    // 1. Skill match
    const workerSkillCategories = worker.skills.map((ws: any) => ws.skill.category);      
    if (workerSkillCategories.includes(job.category)) {
      score += 30;
      reasons.push(`Matches your ${job.category} skills`);
    }

    // 2. Location match
    if (worker.location && job.location) {
      const locationScore = await this.calculateLocationMatch(worker.location, job.location, maxDistance);
      score += locationScore.score;
      if (locationScore.reasons.length > 0) {
        reasons.push(...locationScore.reasons);
      }
    }

    // 3. Price compatibility
    const estimatedHours = job.price / worker.hourlyRate;
    if (estimatedHours >= 2 && estimatedHours <= 6) {
      score += 20;
      reasons.push('Good price for time investment');
    }

    // 4. Client rating
    if (job.client.ratingAvg >= 4.0) {
      score += 10;
      reasons.push('Client has good rating');
    }

    // 5. Urgency bonus
    if (job.urgency === 'URGENT') {
      score += 10;
      reasons.push('Urgent job - higher priority');
    }

    return { score, reasons };
  }
}
