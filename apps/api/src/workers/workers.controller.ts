import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@ApiTags('Workers')
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create worker profile' })
  async create(@Body() createWorkerDto: CreateWorkerDto, @Request() req: any) {
    const userId = req.user.id as string
    // Ensure worker is created for the authenticated user
    return this.workersService.create(createWorkerDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: 'List workers (public)' })
  async findAll() {
    return this.workersService.findAll()
  }



  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Get('my-profile')
  @ApiOperation({ summary: 'Get my worker profile' })
  async myProfile(@Request() req: any) {
    const userId = req.user.id as string
    return this.workersService.findByUserId(userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get worker by ID (public)' })
  async findOne(@Param('id') id: string) {
    return this.workersService.findOne(id)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update worker profile' })
  async update(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto, @Request() req: any) {
    const userId = req.user.id as string
    return this.workersService.update(id, updateWorkerDto, userId)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete worker profile' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id as string
    return this.workersService.remove(id, userId)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Post(':id/skills')
  @ApiOperation({ summary: 'Add skill to worker' })
  async addSkill(@Param('id') id: string, @Body() addSkillDto: AddSkillDto, @Request() req: any) {
    const userId = req.user.id as string
    return this.workersService.addSkill(id, addSkillDto, userId)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/skills/:skillId')
  @ApiOperation({ summary: 'Remove skill from worker' })
  async removeSkill(@Param('id') id: string, @Param('skillId') skillId: string, @Request() req: any) {
    const userId = req.user.id as string
    return this.workersService.removeSkill(id, skillId, userId)
  }

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/availability')
  @ApiOperation({ summary: 'Update worker availability' })
  async updateAvailability(
    @Param('id') id: string,
    @Body() body: { availability: string },
    @Request() req: any,
  ) {
    const userId = req.user.id as string
    return this.workersService.updateAvailability(id, body.availability as any, userId)
  }
}
