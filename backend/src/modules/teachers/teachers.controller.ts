import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TeachersService } from './teachers.service'
import { ClassesService } from '../classes/classes.service'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('teachers')
export class TeachersController {
  constructor(
    private service: TeachersService,
    private classesService: ClassesService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  findAll() {
    return this.service.findAll()
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  findMe(@Req() req: { user: { id: number } }) {
    return this.service.findOne(req.user.id)
  }

  @Get('me/classes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  findMyClasses(@Req() req: { user: { id: number } }) {
    return this.classesService.findByTeacherId(req.user.id)
  }

  @Patch('me/password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  changePassword(@Req() req: { user: { id: number } }, @Body() dto: ChangePasswordDto) {
    return this.service.updatePassword(req.user.id, dto.currentPassword, dto.newPassword)
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    const numId = +id
    if (req.user.role === 'teacher' && numId !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.findOne(numId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  create(@Body() dto: CreateTeacherDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
    @Req() req: { user: { id: number; role: string } },
  ) {
    const numId = +id
    if (req.user.role === 'teacher' && numId !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.update(numId, dto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }
}
