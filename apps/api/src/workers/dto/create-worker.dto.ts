import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

export class CreateWorkerDto {
  @ApiProperty({
    description: 'Worker bio/description',
    example: 'Experienced plumber with 10+ years in residential and commercial plumbing.',
  })
  @IsString()
  bio: string;

  @ApiProperty({
    description: 'Hourly rate in dollars',
    example: 45.00,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  hourlyRate: number;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({
    description: 'Current availability status',
    enum: AvailabilityStatus,
    example: AvailabilityStatus.AVAILABLE,
  })
  @IsEnum(AvailabilityStatus)
  availability: AvailabilityStatus;

  @ApiProperty({
    description: 'Address',
    example: '456 Worker St, New York, NY',
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
    example: 40.7589,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -73.9851,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
