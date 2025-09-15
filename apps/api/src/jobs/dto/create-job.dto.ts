import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, Max } from 'class-validator';

export enum SkillCategory {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  CARPENTRY = 'CARPENTRY',
  CLEANING = 'CLEANING',
  TUTORING = 'TUTORING',
  DELIVERY = 'DELIVERY',
  OTHER = 'OTHER',
}

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateJobDto {
  @ApiProperty({
    description: 'Job title',
    example: 'Fix leaking kitchen sink',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed job description',
    example: 'Kitchen sink has a slow leak under the cabinet. Need professional plumber to fix it.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Service category',
    enum: SkillCategory,
    example: SkillCategory.PLUMBING,
  })
  @IsEnum(SkillCategory)
  category: SkillCategory;

  @ApiProperty({
    description: 'Job budget in dollars',
    example: 150.00,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({
    description: 'Urgency level',
    enum: UrgencyLevel,
    example: UrgencyLevel.MEDIUM,
  })
  @IsEnum(UrgencyLevel)
  urgency: UrgencyLevel;

  @ApiProperty({
    description: 'Scheduled date (optional)',
    example: '2025-09-15T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({
    description: 'Job location address',
    example: '123 Main St, City, State',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'NY',
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 40.7128,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -74.0060,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
