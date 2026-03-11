import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ClassesService } from './classes.service'
import { CreateClassDto } from './dto/create-class.dto'
import { CreateEnrollmentDto } from './dto/create-enrollment.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('classes')
export class ClassesController {
  constructor(private service: ClassesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: { user: { id: number; role: string; school_id?: number } }) {
    if (req.user.role === 'teacher') {
      return this.service.findByTeacherId(req.user.id, req.user.school_id)
    }
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    return this.service.findAll(schoolId)
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    const classEntity = await this.service.findOne(+id)
    if (!classEntity) return classEntity
    if (req.user.role === 'teacher') {
      const classes = await this.service.findByTeacherId(req.user.id)
      if (!classes.some((item) => item.id === classEntity.id)) {
        throw new ForbiddenException('Acesso negado a esta turma')
      }
    }
    return classEntity
  }

  @Get(':id/students')
  @UseGuards(AuthGuard('jwt'))
  async findStudentsByClass(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
  ) {
    if (req.user.role === 'teacher') {
      const classes = await this.service.findByTeacherId(req.user.id, req.user.school_id)
      if (!classes.some((item) => item.id === +id)) {
        throw new ForbiddenException('Acesso negado a esta turma')
      }
    }
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    return this.service.findStudentsByClass(+id, schoolId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  create(@Body() dto: CreateClassDto, @SchoolId() schoolId: number | undefined) {
    return this.service.create(dto, schoolId)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.service.update(+id, dto)
  }

  @Post(':id/enrollments')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  createEnrollment(
    @Param('id') id: string,
    @Body() dto: CreateEnrollmentDto,
    @SchoolId() schoolId: number | undefined,
  ) {
    return this.service.enrollStudent(+id, dto.student_id, schoolId)
  }

  @Delete(':id/enrollments/:studentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  removeEnrollment(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @SchoolId() schoolId: number | undefined,
  ) {
    return this.service.removeEnrollment(+id, +studentId, schoolId)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }
}
