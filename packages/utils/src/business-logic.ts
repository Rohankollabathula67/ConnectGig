import { calculateDistance, GeoLocation } from './geo';
import { formatCurrency } from './formatting';

// Business logic utilities for ConnectGig platform

export interface PricingFactors {
  baseRate: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  distance: number; // in km
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  timeOfDay: 'normal' | 'peak' | 'off-peak';
  dayOfWeek: 'weekday' | 'weekend' | 'holiday';
  demand: 'low' | 'medium' | 'high';
}

export interface WorkerMatch {
  workerId: string;
  score: number;
  reasons: string[];
  estimatedPrice: number;
  distance: number;
  availability: boolean;
}

export interface JobPricing {
  suggestedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  factors: {
    base: number;
    urgency: number;
    distance: number;
    skill: number;
    time: number;
    demand: number;
  };
}

// Pricing multipliers
const PRICING_MULTIPLIERS = {
  urgency: {
    low: 1.0,
    medium: 1.2,
    high: 1.5,
    urgent: 2.0,
  },
  skillLevel: {
    beginner: 0.8,
    intermediate: 1.0,
    expert: 1.5,
  },
  timeOfDay: {
    'off-peak': 0.9,
    normal: 1.0,
    peak: 1.3,
  },
  dayOfWeek: {
    weekday: 1.0,
    weekend: 1.2,
    holiday: 1.5,
  },
  demand: {
    low: 0.9,
    medium: 1.0,
    high: 1.3,
  },
};

// Calculate job pricing based on various factors
export const calculateJobPricing = (factors: PricingFactors): JobPricing => {
  let basePrice = factors.baseRate;
  
  // Apply multipliers
  const urgencyMultiplier = PRICING_MULTIPLIERS.urgency[factors.urgency];
  const skillMultiplier = PRICING_MULTIPLIERS.skillLevel[factors.skillLevel];
  const timeMultiplier = PRICING_MULTIPLIERS.timeOfDay[factors.timeOfDay];
  const dayMultiplier = PRICING_MULTIPLIERS.dayOfWeek[factors.dayOfWeek];
  const demandMultiplier = PRICING_MULTIPLIERS.demand[factors.demand];
  
  // Distance factor (base + per km)
  const distanceFactor = Math.max(1, factors.distance * 0.1);
  
  // Calculate final price
  const suggestedPrice = basePrice * 
    urgencyMultiplier * 
    skillMultiplier * 
    timeMultiplier * 
    dayMultiplier * 
    demandMultiplier * 
    distanceFactor;
  
  // Calculate price range (±15%)
  const priceRange = {
    min: suggestedPrice * 0.85,
    max: suggestedPrice * 1.15,
  };
  
  return {
    suggestedPrice: Math.round(suggestedPrice),
    priceRange: {
      min: Math.round(priceRange.min),
      max: Math.round(priceRange.max),
    },
    factors: {
      base: factors.baseRate,
      urgency: urgencyMultiplier,
      distance: distanceFactor,
      skill: skillMultiplier,
      time: timeMultiplier,
      demand: demandMultiplier,
    },
  };
};

// Calculate worker matching score
export const calculateWorkerMatchScore = (
  worker: {
    id: string;
    skills: string[];
    rating: number;
    hourlyRate: number;
    location: GeoLocation;
    jobsCompleted: number;
    availability: boolean;
  },
  job: {
    requiredSkills: string[];
    budget: number;
    location: GeoLocation;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
  }
): WorkerMatch => {
  let score = 0;
  const reasons: string[] = [];
  
  // Skill match (40% weight)
  const skillMatch = calculateSkillMatch(worker.skills, job.requiredSkills);
  score += skillMatch.score * 0.4;
  if (skillMatch.score > 0.8) {
    reasons.push('Excellent skill match');
  } else if (skillMatch.score > 0.6) {
    reasons.push('Good skill match');
  }
  
  // Rating (20% weight)
  const ratingScore = worker.rating / 5;
  score += ratingScore * 0.2;
  if (worker.rating >= 4.5) {
    reasons.push('High rating');
  } else if (worker.rating >= 4.0) {
    reasons.push('Good rating');
  }
  
  // Experience (15% weight)
  const experienceScore = Math.min(worker.jobsCompleted / 100, 1);
  score += experienceScore * 0.15;
  if (worker.jobsCompleted >= 50) {
    reasons.push('Experienced worker');
  }
  
  // Price compatibility (15% weight)
  const priceScore = calculatePriceCompatibility(worker.hourlyRate, job.budget);
  score += priceScore * 0.15;
  if (priceScore > 0.8) {
    reasons.push('Good price match');
  }
  
  // Distance (10% weight)
  const distance = calculateDistance(worker.location, job.location);
  const distanceScore = Math.max(0, 1 - distance / 50); // 50km max for good score
  score += distanceScore * 0.1;
  if (distance < 5) {
    reasons.push('Very close location');
  } else if (distance < 15) {
    reasons.push('Nearby location');
  }
  
  // Availability bonus
  if (worker.availability) {
    score += 0.1;
    reasons.push('Available now');
  }
  
  // Normalize score to 0-1 range
  score = Math.min(Math.max(score, 0), 1);
  
  // Calculate estimated price
  const estimatedPrice = calculateEstimatedPrice(worker.hourlyRate, job.urgency);
  
  return {
    workerId: worker.id,
    score,
    reasons,
    estimatedPrice,
    distance,
    availability: worker.availability,
  };
};

// Calculate skill match between worker and job
export const calculateSkillMatch = (
  workerSkills: string[],
  requiredSkills: string[]
): { score: number; matchedSkills: string[]; missingSkills: string[] } => {
  const matchedSkills = workerSkills.filter(skill => 
    requiredSkills.includes(skill)
  );
  
  const missingSkills = requiredSkills.filter(skill => 
    !workerSkills.includes(skill)
  );
  
  const score = matchedSkills.length / requiredSkills.length;
  
  return {
    score,
    matchedSkills,
    missingSkills,
  };
};

// Calculate price compatibility
export const calculatePriceCompatibility = (
  workerRate: number,
  jobBudget: number
): number => {
  const ratio = workerRate / jobBudget;
  
  if (ratio <= 0.8) return 1.0; // Worker charges much less
  if (ratio <= 1.0) return 0.9; // Worker charges within budget
  if (ratio <= 1.2) return 0.7; // Worker charges slightly more
  if (ratio <= 1.5) return 0.4; // Worker charges significantly more
  return 0.1; // Worker charges way more
};

// Calculate estimated job price based on worker rate and urgency
export const calculateEstimatedPrice = (
  hourlyRate: number,
  urgency: 'low' | 'medium' | 'high' | 'urgent'
): number => {
  const urgencyMultiplier = PRICING_MULTIPLIERS.urgency[urgency];
  const estimatedHours = 2; // Default estimate
  
  return Math.round(hourlyRate * estimatedHours * urgencyMultiplier);
};

// Calculate commission for platform
export const calculateCommission = (
  jobAmount: number,
  commissionRate: number = 0.15
): number => {
  return Math.round(jobAmount * commissionRate);
};

// Calculate worker earnings after commission
export const calculateWorkerEarnings = (
  jobAmount: number,
  commissionRate: number = 0.15
): number => {
  const commission = calculateCommission(jobAmount, commissionRate);
  return jobAmount - commission;
};

// Calculate trust score based on various factors
export const calculateTrustScore = (
  factors: {
    rating: number;
    jobsCompleted: number;
    responseTime: number; // in minutes
    cancellationRate: number; // 0-1
    verificationStatus: boolean;
    yearsActive: number;
  }
): number => {
  let score = 0;
  
  // Rating (30% weight)
  score += (factors.rating / 5) * 0.3;
  
  // Experience (25% weight)
  const experienceScore = Math.min(factors.jobsCompleted / 100, 1);
  score += experienceScore * 0.25;
  
  // Response time (20% weight)
  const responseScore = Math.max(0, 1 - factors.responseTime / 60); // 1 hour max
  score += responseScore * 0.2;
  
  // Cancellation rate (15% weight)
  const cancellationScore = 1 - factors.cancellationRate;
  score += cancellationScore * 0.15;
  
  // Verification (10% weight)
  if (factors.verificationStatus) {
    score += 0.1;
  }
  
  // Years active (bonus)
  const yearsScore = Math.min(factors.yearsActive / 5, 0.1);
  score += yearsScore;
  
  return Math.min(Math.max(score, 0), 1);
};

// Calculate job completion probability
export const calculateCompletionProbability = (
  factors: {
    workerTrustScore: number;
    jobComplexity: 'simple' | 'medium' | 'complex';
    budgetAdequacy: number; // 0-1, how well budget matches requirements
    urgency: 'low' | 'medium' | 'high' | 'urgent';
  }
): number => {
  let probability = 0.5; // Base probability
  
  // Trust score impact
  probability += factors.workerTrustScore * 0.3;
  
  // Job complexity impact
  const complexityImpact = {
    simple: 0.1,
    medium: 0,
    complex: -0.1,
  };
  probability += complexityImpact[factors.jobComplexity];
  
  // Budget adequacy impact
  probability += factors.budgetAdequacy * 0.2;
  
  // Urgency impact (urgent jobs might be more likely to complete)
  const urgencyImpact = {
    low: -0.05,
    medium: 0,
    high: 0.05,
    urgent: 0.1,
  };
  probability += urgencyImpact[factors.urgency];
  
  return Math.min(Math.max(probability, 0), 1);
};

// Calculate worker ranking for search results
export const calculateWorkerRanking = (
  matchScore: number,
  trustScore: number,
  distance: number,
  availability: boolean
): number => {
  let ranking = matchScore * 0.4 + trustScore * 0.3;
  
  // Distance penalty
  const distancePenalty = Math.min(distance / 100, 0.2);
  ranking -= distancePenalty;
  
  // Availability bonus
  if (availability) {
    ranking += 0.1;
  }
  
  return Math.max(ranking, 0);
};
