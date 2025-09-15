import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { SkillCategory } from '../../jobs/dto/create-job.dto';

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  EXPERT = 'EXPERT',
}

export class AddSkillDto {
  @ApiProperty({
    description: 'Skill name',
    example: 'Pipe Repair',
  })
  @IsString()
  skillName: string;

  @ApiProperty({
    description: 'Skill level',
    enum: SkillLevel,
    example: SkillLevel.EXPERT,
  })
  @IsEnum(SkillLevel)
  level: SkillLevel;

  @ApiProperty({
    description: 'Skill category',
    enum: SkillCategory,
    example: SkillCategory.PLUMBING,
  })
  @IsEnum(SkillCategory)
  category: SkillCategory;

  @ApiProperty({
    description: 'Years of experience',
    example: 5,
    required: false,
  })
  @IsOptional()
  yearsOfExperience?: number;
}
